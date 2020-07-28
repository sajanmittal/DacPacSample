﻿CREATE TABLE [dbo].[TestFKTable]
(
	[Id] INT NOT NULL IDENTITY(1000, 1),
	[TestId] INT NOT NULL, 
    CONSTRAINT [PK_TestFKTable] PRIMARY KEY ([Id])
)
GO

ALTER TABLE [dbo].[TestFKTable]
ADD CONSTRAINT [FK_TestFKTable_TestTable] FOREIGN KEY ([TestId]) REFERENCES [TestTable]([Id])
GO