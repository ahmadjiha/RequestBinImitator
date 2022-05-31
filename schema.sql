-- CREATE DATABASE requestbin;

CREATE TABLE bins (
  id serial PRIMARY KEY,
  url text UNIQUE NOT NULL,
  date_created timestamp, --NOT NULL,
  date_last_used timestamp, --NOT NULL,
  request_count int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE requests (
  id serial PRIMARY KEY,
  bin_id int NOT NULL,
  ip_address varchar(30) NOT NULL,
  request_method varchar(20) NOT NULL,
  headers text NOT NULL,
  received_at timestamp, --NOT NULL,
  content_type text NOT NULL,
  content_length int DEFAULT 0,



  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE
)