// @generated automatically by Diesel CLI.

diesel::table! {
    employees (id) {
        id -> Integer,
        name -> Text,
        email -> Text,
        position -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    payroll_profiles (id) {
        id -> Integer,
        employee_id -> Integer,
        salary -> Double,
        bank_info -> Nullable<Text>,
    }
}

diesel::joinable!(payroll_profiles -> employees (employee_id));

diesel::allow_tables_to_appear_in_same_query!(
    employees,
    payroll_profiles,
);
