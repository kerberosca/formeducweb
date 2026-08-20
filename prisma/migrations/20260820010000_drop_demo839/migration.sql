-- Demo839 est maintenant déployé séparément sur https://escadron839.ca.
-- Supprimer d'abord toutes les tables enfants afin de respecter les clés étrangères.
DROP TABLE IF EXISTS `admin_sessions`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `recurring_schedules`;
DROP TABLE IF EXISTS `login_attempts`;
DROP TABLE IF EXISTS `calendar_years`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `admin_users`;
