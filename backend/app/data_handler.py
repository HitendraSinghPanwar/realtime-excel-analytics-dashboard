import pandas as pd
import traceback
import datetime

EXCEL_FILE_PATH = r"C:\Users\thaku\Downloads\B2C Team Hiring Sheet.xlsx"
SHEET_NAME = "B2C Team Hiring-MIS"
RECRUITER_COL = 'Recruiter Name'
DATE_COL = 'Date'
INTERVIEW_STATUS_COL = 'Interview Status'
TECH_STACK_COL = 'Requirement Name'
WEEK_NUM_COL = 'Week Number'
MONTH_NAME_COL = 'Month Name'


def map_interview_status(status):
    if pd.isna(status):
        return 'Empty'
    status = str(status).lower()
    if 'scheduled' in status:
        return 'Scheduled'
    if 'shortlisted' in status:
        return 'Shortlisted'
    if 'not selected' in status or 'rejected' in status:
        return 'Not Selected'
    if 'on hold' in status:
        return 'On Hold'
    if 'done' in status or 'completed' in status:
        return 'Interview Done'
    if 'selected' in status and 'not' not in status:
        return 'Selected'
    return 'Others'


def _normalize(obj):
    if isinstance(obj, dict):
        return {k: _normalize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_normalize(v) for v in obj]
    if isinstance(obj, pd.Timestamp):
        return obj.strftime("%Y-%m-%d")
    if isinstance(obj, datetime.date):
        return obj.isoformat()
    return obj


def get_data_from_excel():
    try:

        print("Step 1: Reading real Excel file...")
        df = pd.read_excel(EXCEL_FILE_PATH, sheet_name=SHEET_NAME)
        print("Step 1 PASSED.")

        print("Step 2: Processing Date column...")
        df[DATE_COL] = pd.to_datetime(df[DATE_COL], errors='coerce')
        df.dropna(subset=[DATE_COL], inplace=True)
        print("Step 2 PASSED.")

        print("Step 3: Creating chart data...")

        individual_perf = df[RECRUITER_COL].value_counts().reset_index()
        individual_perf.columns = ['Name', 'Value']

        date_wise_perf = df[DATE_COL].dt.strftime('%Y-%m-%d').value_counts().reset_index()
        date_wise_perf.columns = ['Date', 'Count']
        date_wise_perf = date_wise_perf.sort_values(by='Date')

        weekly_df = df.copy()
        weekly_df['Week'] = 'Week ' + weekly_df[WEEK_NUM_COL].astype(str)
        weekly_perf = weekly_df.groupby(['Week', RECRUITER_COL]).size().reset_index(name='Count')

        df['Cleaned Status'] = df[INTERVIEW_STATUS_COL].apply(map_interview_status)
        interview_status = df['Cleaned Status'].value_counts().reset_index()
        interview_status.columns = ['Status', 'Count']

        tech_stack = df[TECH_STACK_COL].value_counts().reset_index()
        tech_stack.columns = ['Name', 'Count']

        monthly_df = df.copy()
        monthly_df['Month'] = monthly_df[MONTH_NAME_COL].astype(str)
        monthly_perf = monthly_df.groupby(['Month', RECRUITER_COL]).size().reset_index(name='Count')
        print("Step 3 PASSED.")

        print("Step 4: Creating final dictionary...")
        all_chart_data = {
            "individualPerformance": individual_perf.to_dict(orient='records'),
            "dateWisePerformance": date_wise_perf.to_dict(orient='records'),
            "weeklyPerformance": weekly_perf.to_dict(orient='records'),
            "interviewStatus": interview_status.to_dict(orient='records'),
            "techStack": tech_stack.to_dict(orient='records'),
            "monthlyPerformance": monthly_perf.to_dict(orient='records'),
        }
        print("Step 4 PASSED.")

        normalized = _normalize(all_chart_data)

        print("--- FUNCTION FINISHED SUCCESSFULLY ---")
        return normalized

    except FileNotFoundError:
        print(f"ERROR: Excel file '{EXCEL_FILE_PATH}' not found.")
        return {"error": f"Excel file '{EXCEL_FILE_PATH}' not found."}
    except KeyError as e:
        print(f"ERROR: Excel sheet column '{e}' not found.")
        return {
            "error": f"Excel sheet column '{e}' not found."
        }
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")
        traceback.print_exc()
        return {"error": f"error: {str(e)}"}
