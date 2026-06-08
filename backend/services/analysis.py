import pandas as pd
import numpy as np

# Month ordering for proper sorting
MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

def _sort_by_month(df, col):
    """Sort dataframe by month column if it contains month names."""
    try:
        vals = df[col].tolist()
        if all(v in MONTH_ORDER for v in vals):
            df = df.copy()
            df['_order'] = df[col].map({m: i for i, m in enumerate(MONTH_ORDER)})
            df = df.sort_values('_order').drop('_order', axis=1)
    except:
        pass
    return df


def _detect_time_col(df):
    """Find the best column to use as X axis for time series."""
    for col in df.columns:
        vals = df[col].dropna().astype(str).tolist()
        # Check if it's month names
        if all(v in MONTH_ORDER for v in vals[:12]):
            return col
        # Check if it looks like a date
        if any(kw in col.lower() for kw in ['date', 'month', 'week', 'year', 'time', 'period', 'quarter']):
            return col
    return None


def compute_kpis(df: pd.DataFrame) -> dict:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    kpis = {
        "total_records": int(len(df)),
        "total_columns": int(len(df.columns)),
        "numeric_columns": numeric_cols,
        "categorical_columns": df.select_dtypes(exclude=[np.number]).columns.tolist(),
        "missing_values": int(df.isnull().sum().sum()),
        "columns": {},
    }
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        kpis["columns"][col] = {
            "sum":    round(float(series.sum()), 4),
            "mean":   round(float(series.mean()), 4),
            "median": round(float(series.median()), 4),
            "std":    round(float(series.std()), 4),
            "min":    round(float(series.min()), 4),
            "max":    round(float(series.max()), 4),
            "count":  int(series.count()),
        }
    return kpis


def generate_chart_data(df: pd.DataFrame) -> list[dict]:
    charts = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols     = df.select_dtypes(exclude=[np.number]).columns.tolist()
    time_col     = _detect_time_col(df)

    # ── Chart 1: Bar — best categorical vs first numeric ──────────────────
    if cat_cols and numeric_cols:
        cat = time_col if time_col else cat_cols[0]
        num = numeric_cols[0]
        grouped = df.groupby(cat)[num].sum().reset_index().head(15)
        grouped = _sort_by_month(grouped, cat)
        charts.append({
            "type":  "bar",
            "title": f"Total {num} by {cat}",
            "xKey":  cat,
            "yKey":  num,
            "data":  grouped.to_dict(orient="records"),
        })

    # ── Chart 2: Line — use time col or meaningful category on X axis ─────
    if numeric_cols:
        num = numeric_cols[0]
        if time_col:
            # Group by time column and sum — proper time series
            grouped = df.groupby(time_col)[num].sum().reset_index()
            grouped = _sort_by_month(grouped, time_col)
            charts.append({
                "type":  "line",
                "title": f"{num} Trend by {time_col}",
                "xKey":  time_col,
                "yKey":  num,
                "data":  grouped.to_dict(orient="records"),
            })
        elif cat_cols:
            # Fallback: use first categorical grouped
            cat = cat_cols[0]
            grouped = df.groupby(cat)[num].sum().reset_index().head(20)
            charts.append({
                "type":  "line",
                "title": f"{num} Trend by {cat}",
                "xKey":  cat,
                "yKey":  num,
                "data":  grouped.to_dict(orient="records"),
            })
        else:
            # Last resort: use row index (clearly labelled)
            sample = df[[num]].dropna().head(50).reset_index(drop=True)
            sample["Row"] = sample.index + 1
            charts.append({
                "type":  "line",
                "title": f"{num} Trend (by row order)",
                "xKey":  "Row",
                "yKey":  num,
                "data":  sample.to_dict(orient="records"),
            })

    # ── Chart 3: Pie — best categorical distribution ───────────────────────
    pie_col = None
    for c in cat_cols:
        if c != time_col:
            pie_col = c
            break
    if not pie_col and cat_cols:
        pie_col = cat_cols[0]

    if pie_col and numeric_cols:
        # Pie shows share of first numeric by category
        grouped = df.groupby(pie_col)[numeric_cols[0]].sum().reset_index().head(8)
        grouped.columns = ["name", "value"]
        charts.append({
            "type":  "pie",
            "title": f"{numeric_cols[0]} Share by {pie_col}",
            "data":  grouped.to_dict(orient="records"),
        })

    # ── Chart 4: Bar — second numeric vs best categorical ─────────────────
    if len(numeric_cols) > 1 and cat_cols:
        cat = time_col if time_col else cat_cols[0]
        num = numeric_cols[1]
        grouped = df.groupby(cat)[num].mean().reset_index().head(15)
        grouped = _sort_by_month(grouped, cat)
        charts.append({
            "type":  "bar",
            "title": f"Avg {num} by {cat}",
            "xKey":  cat,
            "yKey":  num,
            "data":  grouped.to_dict(orient="records"),
        })

    return charts


def detect_trends(df: pd.DataFrame) -> list[dict]:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    time_col     = _detect_time_col(df)
    trends       = []

    for col in numeric_cols[:6]:
        if time_col:
            series = df.groupby(time_col)[col].sum()
            # Re-order by month if applicable
            try:
                if all(v in MONTH_ORDER for v in series.index):
                    series = series.reindex([m for m in MONTH_ORDER if m in series.index])
            except:
                pass
        else:
            series = df[col].dropna()

        if len(series) < 3:
            continue

        x      = np.arange(len(series))
        y      = series.values.astype(float)
        coeffs = np.polyfit(x, y, 1)
        slope  = coeffs[0]
        pct_change = (y[-1] - y[0]) / (abs(y[0]) + 1e-9) * 100

        if slope > 0.01:
            direction, icon = "upward", "📈"
        elif slope < -0.01:
            direction, icon = "downward", "📉"
        else:
            direction, icon = "flat", "➡️"

        trends.append({
            "column":     col,
            "direction":  direction,
            "slope":      round(float(slope), 6),
            "pct_change": round(float(pct_change), 2),
            "icon":       icon,
            "summary":    f"{col} shows a {direction} trend ({pct_change:+.1f}% change)",
        })

    return trends


def detect_anomalies(df: pd.DataFrame) -> list[dict]:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    anomalies    = []

    for col in numeric_cols[:6]:
        series = df[col].dropna()
        if len(series) < 6:
            continue
        Q1      = series.quantile(0.25)
        Q3      = series.quantile(0.75)
        IQR     = Q3 - Q1
        lower   = Q1 - 1.5 * IQR
        upper   = Q3 + 1.5 * IQR
        outliers = series[(series < lower) | (series > upper)]

        if len(outliers) > 0:
            pct = len(outliers) / len(series) * 100
            anomalies.append({
                "column":         col,
                "count":          int(len(outliers)),
                "lower_bound":    round(float(lower), 4),
                "upper_bound":    round(float(upper), 4),
                "outlier_values": [round(v, 4) for v in outliers.head(5).tolist()],
                "pct_of_data":    round(pct, 2),
                "severity":       "high" if pct > 10 else "medium" if pct > 5 else "low",
            })

    return anomalies


def get_dataset_summary(df: pd.DataFrame) -> str:
    kpis      = compute_kpis(df)
    trends    = detect_trends(df)
    anomalies = detect_anomalies(df)

    lines = [
        f"Dataset: {kpis['total_records']} rows, {kpis['total_columns']} columns.",
        f"Numeric columns: {', '.join(kpis['numeric_columns']) or 'none'}.",
        f"Categorical columns: {', '.join(kpis['categorical_columns']) or 'none'}.",
        f"Missing values: {kpis['missing_values']}.",
        "", "Column Statistics:",
    ]
    for col, stats in kpis["columns"].items():
        lines.append(
            f"  {col}: sum={stats['sum']}, mean={stats['mean']}, "
            f"min={stats['min']}, max={stats['max']}, count={stats['count']}"
        )
    lines.append("")
    lines.append("Trends:")
    for t in trends:
        lines.append(f"  {t['summary']}")
    lines.append("")
    lines.append("Anomalies:")
    for a in anomalies:
        lines.append(
            f"  {a['column']}: {a['count']} outliers ({a['pct_of_data']}% of data), severity={a['severity']}"
        )
    return "\n".join(lines)
