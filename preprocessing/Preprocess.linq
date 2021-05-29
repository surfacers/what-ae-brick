<Query Kind="Statements">
  <Connection>
    <ID>bcd5c97b-046c-4ad6-92cf-9cde8fbc42fc</ID>
    <NamingServiceVersion>2</NamingServiceVersion>
    <Persist>true</Persist>
    <Driver Assembly="CsvLINQPadDriver" PublicKeyToken="no-strong-name">CsvLINQPadDriver.CsvDataContextDriver</Driver>
    <DisplayName>C:\dev\fh\what-ae-brick\preprocessing\rebrickable (2021-05-29 16:44:10, 12 files 23 MB)</DisplayName>
    <DriverData>
      <Files># Drag&amp;drop here. Use Ctrl to add files.
# Type one file/folder per line. Wildcards ? and * are supported; **.csv searches in folder and its sub-folders.
# Press Ctrl+Shift+V to clear, paste from clipboard and proceed.
# Press Ctrl+Shift+Alt+V to paste from clipboard and proceed.

C:\dev\fh\what-ae-brick\preprocessing\rebrickable/*.csv
</Files>
    </DriverData>
  </Connection>
  <Reference Relative="Newtonsoft.Json.dll">C:\dev\fh\what-ae-brick\preprocessing\Newtonsoft.Json.dll</Reference>
  <Namespace>Newtonsoft.Json</Namespace>
</Query>

// Settings
var includeCategories = new[] { "Bricks", "Plates" };
var destDir = $"{Path.GetDirectoryName(Util.CurrentQueryPath)}/out";

var printType = "P";

// Part Infos
var partInfos = 
	(from inventory in inventories
	join inventoryPart in inventory_parts
		on inventory.id equals inventoryPart.inventory_id 
	join inventoryMinifig in inventory_minifigs
		on inventory.set_num equals inventoryMinifig.fig_num into inventoryMinifigTemp
		from inventoryMinifig in inventoryMinifigTemp.DefaultIfEmpty()
	join set in sets
		on inventory.set_num equals set.set_num into setTemp
		from set in setTemp.DefaultIfEmpty()
	join part in parts
		on inventoryPart.part_num equals part.part_num
	join partCategory in part_categories
		on part.part_cat_id equals partCategory.id
	join color in colors
		on inventoryPart.color_id equals color.id
	where inventory.set_num.StartsWith("fig") ? inventoryMinifig != null : true // Dont include minifigs not in a set e.g. fig-008915 "Stone Eye"
	   && inventoryPart.is_spare == "f" // Dont include spare parts
	select new { inventory, inventoryPart, inventoryMinifig, part, partCategory, color, set } into joined
	group joined by new 
	{
		partId = joined.part.part_num,
		partName = joined.part.name,
		category = joined.partCategory.name
	} into g
	where includeCategories.Contains(g.Key.category) // Filter out not needed categories, as we only want e.g. Bricks & Plates
	where !part_relationships.Any(r => r.rel_type == printType && r.child_part_num == g.Key.partId) // Filter out print variants of parts
	select new 
	{
		id = g.Key.partId,
		name = g.Key.partName,
		category = g.Key.category,
		productionFrom = g
			.Select(g => !string.IsNullOrWhiteSpace(g.set?.year) 
				? (int?)Convert.ToInt32(g.set?.year) 
				: null)
			.Min(),
		productionTo = g
			.Select(g => !string.IsNullOrWhiteSpace(g.set?.year) 
				? (int?)Convert.ToInt32(g.set?.year) 
				: null)
			.Max(),
		setParts = g
			.GroupBy(g => new { g.inventory.set_num, g.color.id })
			.Select(sets => {
				var set = sets
					.Select(s => new 
					{
						version = Convert.ToInt32(s.inventory.version),
						inventoryPartQuantity = Convert.ToInt32(s.inventoryPart.quantity),
						inventoryMinifigQuantity = Convert.ToInt32(s.inventoryMinifig?.quantity ?? "1") // Default to 1 if part is not in a minifig
					})
					.OrderByDescending(s => s.version) // Use latest version of set
					.First();
				
				return set.inventoryPartQuantity * set.inventoryMinifigQuantity;
			})
			.Sum(),
		sets = g.GroupBy(g => g.inventory.set_num).Count(),
		prints = part_relationships.Where(r => r.parent_part_num == g.Key.partId && r.rel_type == printType).Count()
	})
	.OrderBy(p => p.name);
	
partInfos.Dump();
//Util.WriteCsv(partInfos, $"{destDir}/parts.csv");
File.WriteAllTextAsync($"{destDir}/parts.json", JsonConvert.SerializeObject(partInfos));

// Part Color Info
var partColorInfos = (from inventory in inventories
	join inventoryPart in inventory_parts
		on inventory.id equals inventoryPart.inventory_id 
	join inventoryMinifig in inventory_minifigs
		on inventory.set_num equals inventoryMinifig.fig_num into inventoryMinifigTemp
		from inventoryMinifig in inventoryMinifigTemp.DefaultIfEmpty()
	join set in sets
		on inventory.set_num equals set.set_num into setTemp
		from set in setTemp.DefaultIfEmpty()
	join part in parts
		on inventoryPart.part_num equals part.part_num
	join partCategory in part_categories
		on part.part_cat_id equals partCategory.id
	join color in colors
		on inventoryPart.color_id equals color.id
	where inventory.set_num.StartsWith("fig") ? inventoryMinifig != null : true // Dont include minifigs not in a set e.g. fig-008915 "Stone Eye"
	   && inventoryPart.is_spare == "f" // Dont include spare parts
	select new { inventory, inventoryPart, inventoryMinifig, part, partCategory, color, set } into joined
	group joined by new 
	{
		partId = joined.part.part_num,
		colorId = joined.color.id,
		category = joined.partCategory.name
	} into g
	where includeCategories.Contains(g.Key.category) // Filter out not needed categories, as we only want e.g. Bricks & Plates
	where !part_relationships.Any(r => r.rel_type == printType && r.child_part_num == g.Key.partId) // Filter out print variants of parts
	select new 
	{
		partId = g.Key.partId,
		colorId = g.Key.colorId,
		colorName = g.Select(g => g.color.name).Distinct().First(),
		hex = g.Select(g => g.color.rgb).Distinct().First(),
		isTransparent = g.Select(g => g.color.is_trans == "t").Distinct().First(),
		productionFrom = g
			.Select(g => !string.IsNullOrWhiteSpace(g.set?.year) 
				? (int?)Convert.ToInt32(g.set?.year) 
				: null)
			.Min(),
		productionTo = g
			.Select(g => !string.IsNullOrWhiteSpace(g.set?.year) 
				? (int?)Convert.ToInt32(g.set?.year) 
				: null)
			.Max(),
		setParts = g
			.GroupBy(g => g.inventory.set_num)
			.Select(sets => {
				var set = sets
					.Select(s => new 
					{
						version = Convert.ToInt32(s.inventory.version),
						inventoryPartQuantity = Convert.ToInt32(s.inventoryPart.quantity),
						inventoryMinifigQuantity = Convert.ToInt32(s.inventoryMinifig?.quantity ?? "1") // Default to 1 if part is not in a minifig
					})
					.OrderByDescending(s => s.version) // Use latest version of set
					.First();
				
				return set.inventoryPartQuantity * set.inventoryMinifigQuantity;
			})
			.Sum(),
		sets = g
			.GroupBy(g => g.inventory.set_num)
			.Count()
	})
	.OrderBy(m => m.partId).ThenBy(m => m.colorId);

partColorInfos.Dump();
//Util.WriteCsv(partColorInfos, $"{destDir}/part-colors.csv");
File.WriteAllTextAsync($"{destDir}/parts-colors.json", JsonConvert.SerializeObject(partColorInfos));
