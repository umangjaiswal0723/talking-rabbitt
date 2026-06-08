from fastapi import APIRouter, HTTPException, Query
from services.store import store
from services.forecast import forecast_column, auto_forecast

router = APIRouter()


def _require_data():
    if not store.has_data():
        raise HTTPException(status_code=404, detail="No dataset loaded.")
    return store.get()


@router.get("/forecast")
def get_forecast(
    column: str = Query(None, description="Column to forecast"),
    method: str = Query("linear", description="'linear' or 'moving_average'"),
    steps: int = Query(10, description="Number of steps to forecast"),
):
    df = _require_data()
    if column:
        result = forecast_column(df, column, method=method, steps=steps)
        result["column"] = column
        return result
    else:
        return {"forecasts": auto_forecast(df, steps=steps)}
