### API Documentation

#### GET /
- **Description**: Health check
- **Response**: `200 OK`
```json
{"status": "Backend running"}
```

#### GET /data
- **Description**: Returns dataset from `ml/dataset.csv` as JSON array of rows
- **Response**: `200 OK`
```json
[
  { "col1": "value", "col2": 123 },
  { "col1": "value2", "col2": 456 }
]
```
- **Errors**:
  - `404 Not Found` if dataset is missing
  - `500 Internal Server Error` on read/parse errors

#### GET /analyze
- **Description**: Runs ML analysis by calling `ml.model.analyze_data()` and returns a summary with metrics
- **Response**: `200 OK`
```json
{
  "target_column": "target",
  "feature_columns": ["f1", "f2"],
  "numeric_features": ["f1"],
  "categorical_features": ["f2"],
  "summary": {
    "num_rows": 100,
    "num_columns": 3,
    "columns": ["f1", "f2", "target"],
    "missing_counts": {"f1": 0, "f2": 1, "target": 0},
    "means": {"f1": 0.12, "f2": null, "target": 0.5},
    "medians": {"f1": 0.05, "f2": null, "target": 1},
    "correlations": {"f1": {"f1": 1.0, "target": 0.12}}
  },
  "model": {"type": "RandomForestClassifier", "n_estimators": 100},
  "metrics": {"accuracy": 0.87}
}
```
- **Errors**:
  - `404 Not Found` if `ml/model.py` missing
  - `500 Internal Server Error` if import or analysis fails

#### POST /analyze
- Equivalent to GET `/analyze` but invoked with POST. Useful for clients that prefer POST for compute operations.
