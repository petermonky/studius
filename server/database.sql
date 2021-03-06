--initialize database
CREATE DATABASE studius;

--load extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--create user table
CREATE TABLE users(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

--create tutor table
CREATE TABLE tutors(
  subjects VARCHAR(255)[], --array size and depth ignored during run-time
  rate VARCHAR(255),
  times VARCHAR(255)[],
  education VARCHAR(255),
  description VARCHAR,
  ispublic boolean
) INHERITS (users);

--create student table
CREATE TABLE students(
  subjects VARCHAR(255)[][], --array size and depth ignored during run-time
  rate VARCHAR(255),
  times VARCHAR(255)[],
  description VARCHAR,
  ispublic boolean
) INHERITS (users);

--create forum
CREATE TABLE forums(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject VARCHAR(255) NOT NULL,
  tutor_name VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  tutor_id uuid NOT NULL,
  student_id uuid NOT NULL
);

--create credentials table
CREATE TABLE credentials(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutorid uuid NOT NULL,
    aws_name VARCHAR UNIQUE NOT NULL
);

CREATE TABLE announcements(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    forumid uuid REFERENCES forums(id) ON DELETE CASCADE,
    title TEXT, 
    body TEXT, 
    date VARCHAR(500)
);

CREATE TABLE qna(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    forumid uuid REFERENCES forums(id) ON DELETE CASCADE,  
    question TEXT,
    answer TEXT, 
    dateAsked VARCHAR(500), 
    dateResponded VARCHAR(500)
);

-- renamed to match credentials table for consistency 
CREATE TABLE assignments(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    forumid uuid REFERENCES forums(id) ON DELETE CASCADE,
    ownerid uuid NOT NULL,
    aws_name VARCHAR UNIQUE NOT NULL,
    date VARCHAR(500),
    filename VARCHAR UNIQUE NOT NULL,
    mimetype VARCHAR NOT NULL,
    size BIGINT NOT NULL
);

CREATE TABLE files(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    forumid uuid REFERENCES forums(id) ON DELETE CASCADE,
    ownerid uuid NOT NULL,
    aws_name VARCHAR UNIQUE NOT NULL,
    date VARCHAR(500), 
    filename VARCHAR UNIQUE NOT NULL,
    mimetype VARCHAR NOT NULL,
    size BIGINT NOT NULL
);

--insert sample user
INSERT INTO students (type, firstName, lastName, email, password, subjects) VALUES ('Student', 'John', 'Doe', 'johndoe@email.com', 'password', '{{1, 2, 3}}');
