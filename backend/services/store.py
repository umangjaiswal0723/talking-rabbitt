"""
In-memory data store — supports multiple loaded datasets as tabs.
"""
import pandas as pd
from typing import Optional

class DataStore:
    def __init__(self):
        # Dict of { slot_id: { df, filename, sheets, active_sheet } }
        self._datasets: dict = {}
        self._active_slot: str = ""

    def add(self, df: pd.DataFrame, filename: str, sheets: list = None, active_sheet: str = ""):
        """Add or replace a dataset by filename."""
        slot_id = filename
        self._datasets[slot_id] = {
            "df":           df,
            "filename":     filename,
            "sheets":       sheets or [],
            "active_sheet": active_sheet,
        }
        self._active_slot = slot_id

    def switch(self, filename: str):
        """Switch active dataset."""
        if filename in self._datasets:
            self._active_slot = filename

    def remove(self, filename: str):
        """Remove a dataset."""
        if filename in self._datasets:
            del self._datasets[filename]
        if self._active_slot == filename:
            self._active_slot = list(self._datasets.keys())[-1] if self._datasets else ""

    def get(self) -> Optional[pd.DataFrame]:
        if not self._active_slot or self._active_slot not in self._datasets:
            return None
        return self._datasets[self._active_slot]["df"]

    def get_active(self) -> Optional[dict]:
        if not self._active_slot or self._active_slot not in self._datasets:
            return None
        return self._datasets[self._active_slot]

    def get_filename(self) -> str:
        active = self.get_active()
        return active["filename"] if active else ""

    def get_sheets(self) -> list:
        active = self.get_active()
        return active["sheets"] if active else []

    def get_active_sheet(self) -> str:
        active = self.get_active()
        return active["active_sheet"] if active else ""

    def get_all_filenames(self) -> list:
        return list(self._datasets.keys())

    def has_data(self) -> bool:
        return bool(self._datasets) and self._active_slot in self._datasets

    def clear(self):
        self._datasets = {}
        self._active_slot = ""

    # Legacy compat
    def set(self, df, filename, sheets=None, active_sheet=""):
        self.add(df, filename, sheets, active_sheet)

store = DataStore()
