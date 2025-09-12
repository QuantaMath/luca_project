pub mod core;
pub mod modules;
pub mod schema;
pub mod api;

use tauri::Manager;
use crate::core::event_bus::EventBus;
use crate::modules::employee::repository::EmployeeRepository;
use crate::modules::payroll::listeners::setup_payroll_listeners;

// This function contains the application setup logic.
pub fn run() {
    let db_pool = core::db::establish_connection();

    tauri::Builder::default()
        .manage(db_pool)
        .setup(|app| {
            // Manage concrete types
            app.manage(EventBus::new(app.handle().clone()));
            app.manage(EmployeeRepository);

            // Start the payroll event listener in the background
            setup_payroll_listeners(app.handle());

            Ok(())
        })
        .invoke_handler(api::get_handlers())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// A public module for test utilities, visible to integration tests.
// This has been updated to use the robust TestDbGuard pattern.
pub mod test_utils {
    use crate::core::db::DbPool;
    use diesel::r2d2::{self, ConnectionManager};
    use diesel::sqlite::SqliteConnection;
    use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
    use std::fs;
    use uuid::Uuid;

    // Embed migrations relative to the crate root (src-tauri)
    pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

    /// A guard that creates a temporary, file-based SQLite database for a single test.
    /// When the guard is dropped (at the end of the test), the database file is deleted.
    /// This is the key to preventing test race conditions.
    pub struct TestDbGuard {
        pub pool: DbPool,
        db_path: String,
    }

    impl TestDbGuard {
        /// Creates a new unique database file and runs migrations.
        pub fn new() -> Self {
            let db_name = format!("{}.db", Uuid::new_v4());
            let manager = ConnectionManager::<SqliteConnection>::new(&db_name);
            let pool = r2d2::Pool::builder()
                .build(manager)
                .expect("Failed to create a test database pool.");

            // Run migrations
            let mut conn = pool.get().unwrap();
            conn.run_pending_migrations(MIGRATIONS)
                .expect("Failed to run migrations on test DB.");

            TestDbGuard {
                pool,
                db_path: db_name,
            }
        }
    }

    // This is the crucial part of the RAII pattern. When the guard goes out of
    // scope at the end of a test, this `drop` function is called automatically,
    // ensuring the test database is always cleaned up, even if the test panics.
    impl Drop for TestDbGuard {
        fn drop(&mut self) {
            // The connection pool is dropped automatically, releasing file locks.
            // We then explicitly remove the temporary database file.
            let _ = fs::remove_file(&self.db_path);
        }
    }
}

