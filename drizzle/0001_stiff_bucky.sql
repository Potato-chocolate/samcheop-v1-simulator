CREATE TABLE `consultationReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`shareSlug` varchar(32) NOT NULL,
	`title` varchar(180) NOT NULL,
	`candidateName` varchar(120),
	`memo` text,
	`revenueInputsJson` text NOT NULL,
	`costInputsJson` text NOT NULL,
	`revenueSummaryJson` text NOT NULL,
	`openingSummaryJson` text NOT NULL,
	`reportHtmlKey` varchar(512),
	`reportHtmlUrl` varchar(1024),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultationReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `consultationReports_shareSlug_unique` UNIQUE(`shareSlug`)
);
