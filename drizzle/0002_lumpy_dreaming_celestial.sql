CREATE TABLE `pageviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` varchar(512) NOT NULL,
	`referrer` varchar(512),
	`utmSource` varchar(255),
	`utmMedium` varchar(255),
	`utmCampaign` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pageviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `follow_up_requests` ADD `resultMessage` text;--> statement-breakpoint
ALTER TABLE `quiz_submissions` ADD `utmSource` varchar(255);--> statement-breakpoint
ALTER TABLE `quiz_submissions` ADD `utmMedium` varchar(255);--> statement-breakpoint
ALTER TABLE `quiz_submissions` ADD `utmCampaign` varchar(255);--> statement-breakpoint
ALTER TABLE `waitlist` ADD `interest` varchar(64);