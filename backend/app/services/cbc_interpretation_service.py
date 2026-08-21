import re


class CBCInterpretationService:

    @staticmethod
    def parse_range(reference_range: str):
        """
        Extract lower and upper values from a reference range.
        Example:
        '12.0–16.0' -> (12.0, 16.0)
        '4,000–11,000' -> (4000.0, 11000.0)
        """

        numbers = re.findall(
            r"\d+(?:\.\d+)?",
            reference_range.replace(",", "")
        )

        if len(numbers) < 2:
            return None, None

        lower = float(numbers[0])
        upper = float(numbers[1])

        return lower, upper

    @staticmethod
    def get_status(value: float, reference_range: str) -> str:
        lower, upper = CBCInterpretationService.parse_range(
            reference_range
        )

        if lower is None or upper is None:
            return "Unknown"

        if value < lower:
            return "Low"

        if value > upper:
            return "High"

        return "Normal"

    @staticmethod
    def interpret(cbc_data: dict) -> dict:
        analysis = {}

        for test_name, data in cbc_data.items():

            value = data["value"]
            reference_range = data["reference_range"]
            unit = data["unit"]

            status = CBCInterpretationService.get_status(
                value,
                reference_range,
            )

            analysis[test_name] = {
                "value": value,
                "reference_range": reference_range,
                "unit": unit,
                "status": status,
            }

        return analysis
