import re


class CBCService:

    TEST_MAP = {
        "Hemoglobin": "hemoglobin",
        "WBC Count": "wbc_count",
        "RBC Count": "rbc_count",
        "Platelets": "platelets",
        "Hematocrit": "hematocrit",
        "MCV": "mcv",
        "MCHC": "mchc",
        "MCH": "mch",
        "Neutrophils": "neutrophils",
        "Lymphocytes": "lymphocytes",
    }

    @staticmethod
    def parse_cbc(text: str) -> dict:
        values = {}

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        for i, line in enumerate(lines):

            for test_name, key in CBCService.TEST_MAP.items():

                if line == test_name:

                    # Expected structure:
                    # Test name
                    # Result
                    # Reference Range
                    # Unit

                    if i + 3 < len(lines):

                        result_text = lines[i + 1]
                        reference_range = lines[i + 2]
                        unit = lines[i + 3]

                        # Remove commas from numbers
                        clean_result = result_text.replace(",", "")

                        # Extract numerical result
                        result_match = re.search(
                            r"\d+(?:\.\d+)?",
                            clean_result
                        )

                        if result_match:
                            values[key] = {
                                "value": float(result_match.group()),
                                "reference_range": reference_range,
                                "unit": unit,
                            }

                    break

        return values
