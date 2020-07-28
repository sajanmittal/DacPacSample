using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.SqlServer.Dac;
using Microsoft.SqlServer.Dac.Model;
using Microsoft.SqlServer.TransactSql.ScriptDom;

namespace DacPacSample
{
	class DbHelper
	{
		public static void GeneratePackage()
		{
			try
			{
				//TSqlModel sqlModel = TSqlModel.LoadFromDacpac(@"D:\testdb.dacpac", new ModelLoadOptions());
				TSqlModel sqlModel1 = new TSqlModel(SqlServerVersion.Sql150, new TSqlModelOptions());
				var files = Directory.GetFiles(@"D:\Visual Studio Projects\DacPacSample\Oracle", "regions.sql", SearchOption.AllDirectories);

				foreach(var file in files)
				{
					var model = new TSqlModel(file, DacSchemaModelStorageType.File);
					model.Validate();
				}

				var messages = sqlModel1.Validate();
				foreach (var item in messages)
				{
					Console.WriteLine(item.Message);
				}

				DacPackageExtensions.BuildPackage(@"D:\test.dacpac", sqlModel1, new PackageMetadata { Name = "TestDacPac" }, new PackageOptions { TreatWarningsAsErrors = false });
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.ToString());
			}
		}
	}
}
