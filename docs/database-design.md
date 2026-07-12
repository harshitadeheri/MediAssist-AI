# Database Design

## Users

- id
- name
- email
- password
- created_at

## Reports

- id
- user_id
- filename
- report_type
- upload_date

## Predictions

- id
- report_id
- prediction
- confidence

## ChatHistory

- id
- user_id
- question
- answer
- timestamp