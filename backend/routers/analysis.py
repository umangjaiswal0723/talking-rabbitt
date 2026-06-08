from fastapi import APIRouter, HTTPException
from services.store import store
from services.analysis import compute_kpis, generate_chart_data, detect_trends, detect_anomalies, get_dataset_summary
from services.gemini import generate_recommendations, generate_insight_summary

router = APIRouter()


def _require_data():
    if not store.has_data():
        raise HTTPException(status_code=404, detail="No dataset loaded. Please upload a file first.")
    return store.get()


@router.get("/kpis")
def get_kpis():
    df = _require_data()
    return compute_kpis(df)


@router.get("/charts")
def get_charts():
    df = _require_data()
    return generate_chart_data(df)


@router.get("/trends")
def get_trends():
    df = _require_data()
    return detect_trends(df)


@router.get("/anomalies")
def get_anomalies():
    df = _require_data()
    return detect_anomalies(df)


@router.get("/recommendations")
def get_recommendations():
    df = _require_data()
    summary = get_dataset_summary(df)
    recs = generate_recommendations(summary)
    return {"recommendations": recs}


@router.get("/summary")
def get_summary():
    df = _require_data()
    summary = get_dataset_summary(df)
    insight = generate_insight_summary(summary)
    return {"insight": insight, "raw_summary": summary}
