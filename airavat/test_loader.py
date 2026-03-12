import json

from airavat.loader import load_events
from airavat.training import predict_risk_scores, train_risk_model


def test_load_sample_events():
    events = load_events("data/sample_events.json")
    assert len(events) == 3
    assert events[0].event_id == "evt_1971_naval_signal"


def test_load_raw_events(tmp_path):
    raw_path = tmp_path / "raw_events.json"
    raw_path.write_text(
        json.dumps(
            [
                {
                    "id": "HIST-1998-001",
                    "category": "Economic Warfare & Sanctions (1998)",
                    "scenario": "Western bloc imposes sanctions after nuclear tests.",
                    "keywords": "1998 sanctions pokhran economy pressure",
                    "countermeasures": ["Build financial resilience."],
                }
            ]
        ),
        encoding="utf-8",
    )

    events = load_events(raw_path, data_format="raw")
    assert len(events) == 1
    assert events[0].event_id == "HIST-1998-001"
    assert events[0].date == "1998-01-01"
    assert "economic_coercion" in events[0].event_types


def test_train_risk_model_scores_query():
    events = load_events("data/sample_events.json")
    model = train_risk_model(events)
    scores = predict_risk_scores(model, "new sanctions pressure against india")

    assert "economic_coercion" in scores
    assert scores["economic_coercion"] > 0
