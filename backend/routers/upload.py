from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import pandas as pd
import numpy as np
import io
from services.store import store
from services.analysis import compute_kpis, generate_chart_data, detect_trends, detect_anomalies

router = APIRouter()


def _safe_preview(df: pd.DataFrame) -> list[dict]:
    preview_df = df.head(10).copy()
    for col in preview_df.columns:
        if preview_df[col].dtype in [float, np.float64, np.float32]:
            preview_df[col] = preview_df[col].replace([np.inf, -np.inf], np.nan)
    return preview_df.fillna("").astype(str).to_dict(orient="records")


def _build_response(df: pd.DataFrame, filename: str, sheets: list, active_sheet: str) -> dict:
    kpis      = compute_kpis(df)
    charts    = generate_chart_data(df)
    trends    = detect_trends(df)
    anomalies = detect_anomalies(df)
    preview   = _safe_preview(df)
    return {
        "filename":        filename,
        "sheets":          sheets,
        "active_sheet":    active_sheet,
        "kpis":            kpis,
        "charts":          charts,
        "trends":          trends,
        "anomalies":       anomalies,
        "preview":         preview,
        "columns":         df.columns.tolist(),
        "loaded_files":    store.get_all_filenames(),
        "active_file":     store.get_filename(),
    }


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    sheet: str = Query(None, description="Sheet name for Excel files")
):
    filename = (file.filename or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="No filename received.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    try:
        if filename.endswith(".csv"):
            for enc in ["utf-8", "latin-1", "cp1252"]:
                try:
                    df = pd.read_csv(io.BytesIO(content), encoding=enc)
                    break
                except UnicodeDecodeError:
                    continue
            sheets       = []
            active_sheet = ""

        elif filename.endswith((".xls", ".xlsx")):
            xl     = pd.ExcelFile(io.BytesIO(content))
            sheets = xl.sheet_names
            active_sheet = sheet if (sheet and sheet in sheets) else sheets[0]
            df = xl.parse(active_sheet)
            print(f"[UPLOAD] Sheet: '{active_sheet}' from {filename}")

        else:
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=422, detail="The file has no data.")

    df.columns = [str(c).strip() for c in df.columns]
    store.add(df, filename, sheets, active_sheet)

    return _build_response(df, filename, sheets, active_sheet)


@router.post("/switch-file")
async def switch_file(filename: str = Query(..., description="Filename to switch to")):
    """Switch active dataset to a previously uploaded file."""
    loaded = store.get_all_filenames()
    if filename not in loaded:
        raise HTTPException(status_code=404, detail=f"File '{filename}' not loaded. Loaded files: {loaded}")
    store.switch(filename)
    df           = store.get()
    active       = store.get_active()
    return _build_response(df, active["filename"], active["sheets"], active["active_sheet"])


@router.delete("/remove-file")
async def remove_file(filename: str = Query(..., description="Filename to remove")):
    """Remove a loaded dataset."""
    loaded = store.get_all_filenames()
    if filename not in loaded:
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found.")
    store.remove(filename)
    return {
        "removed":      filename,
        "loaded_files": store.get_all_filenames(),
        "active_file":  store.get_filename(),
    }


@router.get("/dataset/status")
def dataset_status():
    if not store.has_data():
        return {"loaded": False}
    df = store.get()
    return {
        "loaded":        True,
        "filename":      store.get_filename(),
        "rows":          len(df),
        "columns":       df.columns.tolist(),
        "sheets":        store.get_sheets(),
        "active_sheet":  store.get_active_sheet(),
        "loaded_files":  store.get_all_filenames(),
        "active_file":   store.get_filename(),
    }
