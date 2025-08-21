// @generated automatically by Diesel CLI.

diesel::table! {
    employees (id) {
        id -> Integer,
        name -> Text,
        email -> Text,
        phone -> Text,
        position -> Text,
        created_at -> Timestamp,
    }
}
