ALTER TABLE users
  ADD COLUMN IF NOT EXISTS chatbot_genre_option VARCHAR(64),
  ADD COLUMN IF NOT EXISTS chatbot_reading_time_option VARCHAR(64),
  ADD COLUMN IF NOT EXISTS chatbot_recent_book_option VARCHAR(64),
  ADD COLUMN IF NOT EXISTS chatbot_preferences_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_chatbot_genre_option
  ON users(chatbot_genre_option);

CREATE INDEX IF NOT EXISTS idx_users_chatbot_reading_time_option
  ON users(chatbot_reading_time_option);

CREATE INDEX IF NOT EXISTS idx_users_chatbot_recent_book_option
  ON users(chatbot_recent_book_option);
