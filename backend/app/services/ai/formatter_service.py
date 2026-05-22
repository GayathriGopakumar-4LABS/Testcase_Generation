import csv
import io
import json
from typing import List


class FormatterService:
    """Converts test-case dicts into JSON / CSV / Markdown for export endpoints."""

    def to_json(self, test_cases: List[dict]) -> str:
        return json.dumps(test_cases, indent=2, ensure_ascii=False)

    def to_csv(self, test_cases: List[dict], title: str = "Test Cases") -> str:
        if not test_cases:
            return ""

        output = io.StringIO()
        fieldnames = [
            "Sl. No",
            "Test Case ID",
            "Req. ID/User Story",
            "Priority",
            "Scenario/Test Case Description",
            "Pre-Condition",
            "Test Steps",
            "Test Data",
            "Expected Result",
            "Actual Result",
            "Status",
            "Defect ID Raised",
            "Defect Status",
            "Build Version",
            "Remarks",
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writerow({"Sl. No": "", "Test Case ID": title})
        writer.writeheader()

        previous_requirement_id = None
        for index, tc in enumerate(test_cases, start=1):
            requirement_id = tc.get("requirement_id", "")
            if requirement_id and requirement_id != previous_requirement_id:
                writer.writerow({
                    "Sl. No": "",
                    "Test Case ID": "",
                    "Req. ID/User Story": "",
                    "Priority": "",
                    "Scenario/Test Case Description": f"--- SECTION: {requirement_id} ---",
                    "Pre-Condition": "",
                    "Test Steps": "",
                    "Test Data": "",
                    "Expected Result": "",
                    "Actual Result": "",
                    "Status": "",
                    "Defect ID Raised": "",
                    "Defect Status": "",
                    "Build Version": "",
                    "Remarks": "",
                })
                previous_requirement_id = requirement_id

            steps = tc.get("steps", [])
            row = {
                "Sl. No": index,
                "Test Case ID": tc.get("test_case_id", f"TC-{index:03d}"),
                "Req. ID/User Story": requirement_id,
                "Priority": tc.get("priority", ""),
                "Scenario/Test Case Description": tc.get("scenario") or tc.get("title", ""),
                "Pre-Condition": tc.get("preconditions", ""),
                "Test Steps": "\n".join(
                    f"{step_index}. {step}" for step_index, step in enumerate(steps, start=1)
                ) if isinstance(steps, list) else str(steps),
                "Test Data": tc.get("test_data", ""),
                "Expected Result": tc.get("expected_result", ""),
                "Actual Result": tc.get("actual_result", ""),
                "Status": tc.get("status", ""),
                "Defect ID Raised": tc.get("defect_id", ""),
                "Defect Status": tc.get("defect_status", ""),
                "Build Version": tc.get("build_version", ""),
                "Remarks": tc.get("remarks", ""),
            }
            writer.writerow(row)

        return output.getvalue()

    def to_markdown(self, test_cases: List[dict], title: str = "Test Cases") -> str:
        lines: List[str] = [f"# {title}\n", f"**Total test cases:** {len(test_cases)}\n", "---\n"]

        for i, tc in enumerate(test_cases, start=1):
            priority = tc.get("priority", "N/A")
            priority_emoji = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}.get(priority, "⚪")

            lines.append(f"## {i}. {tc.get('title', 'Untitled')}\n")
            if tc.get("test_case_id") or tc.get("requirement_id"):
                lines.append(
                    f"**ID:** {tc.get('test_case_id', 'N/A')} &nbsp;&nbsp; "
                    f"**Requirement:** {tc.get('requirement_id', 'N/A')}\n"
                )
            lines.append(f"**Priority:** {priority_emoji} {priority} &nbsp;&nbsp; **Type:** {tc.get('test_type', 'N/A')}\n")
            if tc.get("scenario"):
                lines.append(f"### Scenario\n{tc.get('scenario')}\n")
            lines.append(f"### Preconditions\n{tc.get('preconditions', 'None')}\n")
            lines.append("### Steps")

            steps = tc.get("steps", [])
            if isinstance(steps, list):
                for j, step in enumerate(steps, start=1):
                    lines.append(f"{j}. {step}")
            else:
                lines.append(str(steps))

            lines.append(f"\n### Expected Result\n{tc.get('expected_result', 'N/A')}\n")
            if tc.get("test_data"):
                lines.append(f"### Test Data\n{tc.get('test_data')}\n")
            if tc.get("remarks"):
                lines.append(f"### Remarks\n{tc.get('remarks')}\n")
            lines.append("---\n")

        return "\n".join(lines)
