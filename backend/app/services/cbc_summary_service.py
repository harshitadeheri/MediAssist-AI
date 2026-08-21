class CBCSummaryService:

    @staticmethod
    def generate_summary(analysis: dict) -> dict:
        normal_count = 0
        high_count = 0
        low_count = 0

        for parameter in analysis.values():
            status = parameter.get("status")

            if status == "Normal":
                normal_count += 1
            elif status == "High":
                high_count += 1
            elif status == "Low":
                low_count += 1

        total = len(analysis)

        if high_count == 0 and low_count == 0:
            overall_status = "Normal"
            summary = (
                "All analyzed CBC parameters are within the "
                "reference ranges provided in the report."
            )
        else:
            overall_status = "Attention Required"
            summary = (
                f"{high_count} parameter(s) are above and "
                f"{low_count} parameter(s) are below the "
                "provided reference ranges."
            )

        return {
            "overall_status": overall_status,
            "summary": summary,
            "normal_count": normal_count,
            "high_count": high_count,
            "low_count": low_count,
            "total_parameters": total,
        }
