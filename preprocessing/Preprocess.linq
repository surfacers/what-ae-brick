<Query Kind="Statements" />

// Settings
var includeCategories = new[] { "Bricks", "Plates" };
var destDir = $"{Path.GetDirectoryName(Util.CurrentQueryPath)}/out/csv";

var printType = "P";

// Color Info
var colorInfos = from color in colors
select new 
{
	id = color.id,
	name = color.name,
	hex = color.rgb,
	isTransparent = color.is_trans == "t"
};

colorInfos.Dump();
Util.WriteCsv(colorInfos, $"{destDir}/colors.csv");

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
		productionFrom = g.Select(g => g.set?.year).Min(),
		productionTo = g.Select(g => g.set?.year).Max(),
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
Util.WriteCsv(partInfos, $"{destDir}/parts.csv");

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
		productionFrom = g.Select(g => g.set?.year).Min(),
		productionTo = g.Select(g => g.set?.year).Max(),
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
Util.WriteCsv(partColorInfos, $"{destDir}/part-colors.csv");
