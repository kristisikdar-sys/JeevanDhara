import os
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier


DATASET_RELATIVE_PATH = os.path.join(os.path.dirname(__file__), "dataset.csv")


def _load_dataset(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}")
    df = pd.read_csv(path)
    if df.empty:
        raise ValueError("Dataset is empty")
    return df


def _infer_target_column(df: pd.DataFrame) -> str:
    # Heuristics: prefer 'target' or 'label'; else last column
    for candidate in ["target", "label", "y", "class"]:
        if candidate in df.columns:
            return candidate
    return df.columns[-1]


def _split_features_target(df: pd.DataFrame, target_col: str) -> Tuple[pd.DataFrame, pd.Series]:
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return X, y


def _build_pipeline(X: pd.DataFrame) -> Tuple[Pipeline, List[str], List[str]]:
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = [c for c in X.columns if c not in numeric_features]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler(with_mean=False)),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse=True)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    # Choose a robust default classifier
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)

    model = Pipeline(steps=[("preprocess", preprocessor), ("clf", classifier)])

    return model, numeric_features, categorical_features


def _dataset_summary(df: pd.DataFrame) -> Dict[str, Any]:
    numeric_df = df.select_dtypes(include=[np.number])
    summary: Dict[str, Any] = {
        "num_rows": int(df.shape[0]),
        "num_columns": int(df.shape[1]),
        "columns": list(df.columns),
        "missing_counts": {col: int(df[col].isna().sum()) for col in df.columns},
        "means": {col: (float(numeric_df[col].mean()) if col in numeric_df.columns else None) for col in df.columns},
        "medians": {col: (float(numeric_df[col].median()) if col in numeric_df.columns else None) for col in df.columns},
        "correlations": {},
    }

    # Compute correlations among numeric columns only, guard against empty
    if numeric_df.shape[1] >= 2:
        corr = numeric_df.corr(numeric_only=True)
        # Convert to nested dict of floats
        summary["correlations"] = {
            row: {col: (float(val) if not pd.isna(val) else None) for col, val in corr.loc[row].items()}
            for row in corr.index
        }

    return summary


def analyze_data() -> Dict[str, Any]:
    """Load dataset, clean missing values, compute summary stats, train model, return metrics.

    The function returns a JSON-serializable dictionary with dataset summary and model accuracy.
    """
    df = _load_dataset(DATASET_RELATIVE_PATH)

    # Identify target and split
    target_col = _infer_target_column(df)
    X, y = _split_features_target(df, target_col)

    # Build pipeline (contains imputers that handle missing values)
    model, numeric_features, categorical_features = _build_pipeline(X)

    # For classification, we need discrete target. If y is numeric with many unique values,
    # attempt to binarize by median as a fallback heuristic.
    if pd.api.types.is_numeric_dtype(y) and y.nunique(dropna=True) > 10:
        y = (y > y.median()).astype(int)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() > 1 else None
    )

    # Train
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    try:
        accuracy = float(accuracy_score(y_test, y_pred))
    except Exception:
        accuracy = float(np.mean(y_pred == y_test))

    # Prepare summary
    summary = _dataset_summary(df)

    result: Dict[str, Any] = {
        "target_column": target_col,
        "feature_columns": list(X.columns),
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "summary": summary,
        "model": {
            "type": "RandomForestClassifier",
            "n_estimators": 100,
        },
        "metrics": {"accuracy": accuracy},
    }

    return result
