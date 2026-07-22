CREATE TABLE `admin_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`idle_expires_at` text NOT NULL,
	`absolute_expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_token_idx` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`password_iterations` integer DEFAULT 600000 NOT NULL,
	`must_change_password` integer DEFAULT true NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_idx` ON `admin_users` (`username`);--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`publish_date` text NOT NULL,
	`expires_on` text,
	`is_pinned` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` integer,
	`updated_by` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `announcements_public_idx` ON `announcements` (`status`,`publish_date`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`summary` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `calendar_years` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_years_label_idx` ON `calendar_years` (`label`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calendar_year_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`callout` text DEFAULT 'standard' NOT NULL,
	`cancellation_note` text DEFAULT '' NOT NULL,
	`created_by` integer,
	`updated_by` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`calendar_year_id`) REFERENCES `calendar_years`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_date_idx` ON `events` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `events_status_idx` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `events_year_idx` ON `events` (`calendar_year_id`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`ip_address` text NOT NULL,
	`attempted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_attempts_lookup_idx` ON `login_attempts` (`username`,`ip_address`,`attempted_at`);--> statement-breakpoint
CREATE TABLE `recurring_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calendar_year_id` integer NOT NULL,
	`category_id` integer,
	`title` text NOT NULL,
	`weekday` integer NOT NULL,
	`weekday_label` text NOT NULL,
	`time_label` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`calendar_year_id`) REFERENCES `calendar_years`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `admin_users`
  (`id`, `username`, `display_name`, `password_hash`, `password_salt`, `password_iterations`, `must_change_password`, `is_active`)
VALUES
  (1, 'admin', 'Administrateur', 'eafeac6d391738e2ce5edd5cf4a76811fa47172da19c4976c87a8df6ea9b1953', '9a0da99a17a9e8adbbf973dea9d405a4', 600000, 1, 1);
--> statement-breakpoint
INSERT INTO `calendar_years`
  (`id`, `label`, `start_date`, `end_date`, `is_current`, `revision`)
VALUES
  (1, '2026–2027', '2026-09-01', '2027-06-30', 1, 0);
--> statement-breakpoint
INSERT INTO `categories` (`id`, `name`, `slug`, `color`, `sort_order`, `is_active`) VALUES
  (1, 'Programme cadets', 'programme-cadets', '#10a8dc', 10, 1),
  (2, 'Optionnelle / Bonus', 'optionnelle-bonus', '#8ed14f', 20, 1),
  (3, 'Congé', 'conge', '#ff1717', 30, 1),
  (4, 'Rentrée / Début', 'rentree-debut', '#ffc21c', 40, 1);
--> statement-breakpoint
INSERT INTO `events`
  (`calendar_year_id`, `category_id`, `title`, `description`, `location`, `start_date`, `end_date`, `status`, `callout`, `created_by`, `updated_by`)
VALUES
  (1, 4, 'Début des anciens cadets', '', '', '2026-09-02', '2026-09-02', 'draft', 'standard', 1, 1),
  (1, 4, 'Début des recrues cadets', '', '', '2026-09-09', '2026-09-09', 'draft', 'standard', 1, 1),
  (1, 2, 'Début optionnelle tir / biathlon', '', '', '2026-09-10', '2026-09-10', 'draft', 'standard', 1, 1),
  (1, 1, 'Planeur', '', '', '2026-09-19', '2026-09-19', 'draft', 'standard', 1, 1),
  (1, 1, 'Survie pour équipage de vol', '', '', '2026-10-02', '2026-10-04', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade du commandant', '', '', '2026-10-07', '2026-10-07', 'draft', 'parade_commandant', 1, 1),
  (1, 1, 'Cueillette de bouteilles', '', '', '2026-10-24', '2026-10-24', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade Halloween des Lions', '', '', '2026-10-31', '2026-10-31', 'draft', 'standard', 1, 1),
  (1, 2, 'Biathlon — Patrouille régionale', '', '', '2026-11-01', '2026-11-01', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade du mois', '', '', '2026-11-04', '2026-11-04', 'draft', 'parade_month', 1, 1),
  (1, 1, 'Parade de l’armistice', '', '', '2026-11-08', '2026-11-08', 'draft', 'standard', 1, 1),
  (1, 2, 'Clinique musicale', '', '', '2026-11-20', '2026-11-22', 'draft', 'standard', 1, 1),
  (1, 2, 'Biathlon — Patrouille provinciale', '', '', '2026-12-04', '2026-12-06', 'draft', 'standard', 1, 1),
  (1, 2, 'Souper de Noël', '', '', '2026-12-06', '2026-12-06', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade du commandant', '', '', '2026-12-09', '2026-12-09', 'draft', 'parade_commandant', 1, 1),
  (1, 1, 'PITAI', '', '', '2026-12-11', '2026-12-13', 'draft', 'standard', 1, 1),
  (1, 3, 'Congé des Fêtes', '', '', '2026-12-21', '2026-12-31', 'draft', 'standard', 1, 1),
  (1, 4, 'Début cadets', '', '', '2027-01-06', '2027-01-06', 'draft', 'standard', 1, 1),
  (1, 1, 'Cueillette de bouteilles', '', '', '2027-01-09', '2027-01-10', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade du mois', '', '', '2027-02-03', '2027-02-03', 'draft', 'parade_month', 1, 1),
  (1, 1, 'Survie hivernale — à confirmer', '', '', '2027-02-05', '2027-02-07', 'draft', 'standard', 1, 1),
  (1, 1, 'Leadership N3 et N4', '', '', '2027-02-19', '2027-02-21', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade du commandant', '', '', '2027-03-03', '2027-03-03', 'draft', 'parade_commandant', 1, 1),
  (1, 2, 'Championnat de tir de zone', '', '', '2027-03-12', '2027-03-13', 'draft', 'standard', 1, 1),
  (1, 2, 'Festival de musique — musiciens', '', '', '2027-03-19', '2027-03-21', 'draft', 'standard', 1, 1),
  (1, 3, 'Congé de Pâques', '', '', '2027-03-27', '2027-03-29', 'draft', 'standard', 1, 1),
  (1, 1, 'Parade du mois', '', '', '2027-04-07', '2027-04-07', 'draft', 'parade_month', 1, 1),
  (1, 2, 'Championnat de tir provincial', '', '', '2027-04-16', '2027-04-19', 'draft', 'standard', 1, 1),
  (1, 1, 'Cérémonial', '', '', '2027-05-15', '2027-05-15', 'draft', 'standard', 1, 1),
  (1, 2, 'Voyage de fin d’année', '', '', '2027-05-21', '2027-05-23', 'draft', 'standard', 1, 1),
  (1, 2, 'Vol d’avion', '', '', '2027-06-12', '2027-06-12', 'draft', 'standard', 1, 1);
--> statement-breakpoint
INSERT INTO `recurring_schedules`
  (`calendar_year_id`, `category_id`, `title`, `weekday`, `weekday_label`, `time_label`, `status`, `sort_order`)
VALUES
  (1, 1, 'Soirée régulière', 3, 'Mercredi', '18 h 30 à 21 h', 'draft', 10),
  (1, 2, 'Tir optionnel', 4, 'Jeudi', '', 'draft', 20),
  (1, 2, 'Musique optionnelle', 1, 'Lundi', '', 'draft', 30);
--> statement-breakpoint
INSERT INTO `audit_log` (`user_id`, `action`, `entity_type`, `entity_id`, `summary`)
VALUES (1, 'imported', 'calendar_year', 1, 'Calendrier 2026–2027 importé des documents fournis en brouillon');


UPDATE events
SET status = 'published', updated_at = CURRENT_TIMESTAMP
WHERE calendar_year_id = 1 AND status = 'draft';
--> statement-breakpoint
UPDATE recurring_schedules
SET status = 'published', updated_at = CURRENT_TIMESTAMP
WHERE calendar_year_id = 1 AND status = 'draft';
--> statement-breakpoint
UPDATE calendar_years
SET revision = revision + 1, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
--> statement-breakpoint
INSERT INTO audit_log (user_id, action, entity_type, entity_id, summary)
VALUES (1, 'published', 'calendar_year', 1, 'Calendrier 2026-2027 valide a partir des deux images et publie');

