ALTER TABLE audit_logs
  ADD COLUMN module varchar(128) NULL,
  ADD COLUMN previous_data JSON NULL,
  ADD COLUMN updated_data JSON NULL,
  ADD COLUMN ip_address varchar(64) NULL,
  ADD COLUMN browser varchar(255) NULL,
  ADD COLUMN operating_system varchar(128) NULL,
  ADD COLUMN request_id varchar(64) NULL;

CREATE INDEX audit_logs_created_idx ON audit_logs (created_at);
CREATE INDEX audit_logs_action_idx ON audit_logs (action);
