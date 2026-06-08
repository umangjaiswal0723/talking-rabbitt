import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def _clean_series(series: pd.Series) -> pd.Series:
    """Remove NaN and infinite values."""
    series = pd.to_numeric(series, errors="coerce")
    series = series.replace([np.inf, -np.inf], np.nan).dropna()
    return series


def moving_average_forecast(series: pd.Series, window: int = 3, steps: int = 10) -> dict:
    series = _clean_series(series)
    if len(series) < window:
        return {"error": f"Need at least {window} data points for moving average."}

    last_values = series.tail(window).values.astype(float)
    forecasted  = []
    for _ in range(steps):
        next_val = float(np.mean(last_values))
        forecasted.append(round(next_val, 4))
        last_values = np.append(last_values[1:], next_val)

    historical = [
        {"index": int(i), "value": round(float(v), 4), "type": "historical"}
        for i, v in enumerate(series.values)
    ]
    forecast_data = [
        {"index": len(series) + i, "value": v, "type": "forecast"}
        for i, v in enumerate(forecasted)
    ]
    return {
        "method":    "moving_average",
        "window":    window,
        "steps":     steps,
        "historical": historical,
        "forecast":   forecast_data,
        "combined":   historical + forecast_data,
    }


def linear_regression_forecast(series: pd.Series, steps: int = 10) -> dict:
    series = _clean_series(series)
    if len(series) < 3:
        return {"error": "Need at least 3 data points for linear regression."}

    X      = np.arange(len(series)).reshape(-1, 1)
    y      = series.values.astype(float)
    model  = LinearRegression()
    model.fit(X, y)

    r2        = float(model.score(X, y))
    fitted    = model.predict(X)
    future_X  = np.arange(len(series), len(series) + steps).reshape(-1, 1)
    predicted = model.predict(future_X)

    historical = [
        {"index": int(i), "value": round(float(v), 4), "fitted": round(float(f), 4), "type": "historical"}
        for i, (v, f) in enumerate(zip(y, fitted))
    ]
    forecast_data = [
        {"index": len(series) + i, "value": round(float(v), 4), "type": "forecast"}
        for i, v in enumerate(predicted)
    ]
    return {
        "method":     "linear_regression",
        "slope":      round(float(model.coef_[0]), 6),
        "intercept":  round(float(model.intercept_), 4),
        "r2_score":   round(r2, 4),
        "steps":      steps,
        "historical": historical,
        "forecast":   forecast_data,
        "combined":   historical + forecast_data,
        "trend":      "upward" if model.coef_[0] > 0 else "downward",
    }


def forecast_column(df: pd.DataFrame, column: str, method: str = "linear", steps: int = 10) -> dict:
    if column not in df.columns:
        return {"error": f"Column '{column}' not found in dataset."}
    series = _clean_series(df[column])
    if len(series) == 0:
        return {"error": f"Column '{column}' has no valid numeric data."}
    if method == "moving_average":
        return moving_average_forecast(series, steps=steps)
    return linear_regression_forecast(series, steps=steps)


def auto_forecast(df: pd.DataFrame, steps: int = 10) -> list[dict]:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    results = []
    for col in numeric_cols[:4]:
        r = linear_regression_forecast(_clean_series(df[col]), steps=steps)
        r["column"] = col
        results.append(r)
    return results
