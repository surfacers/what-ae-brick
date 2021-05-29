# Rebrickable Data Preprocessing
Preprocessing rebrickable database ([available as csv files on their website](https://rebrickable.com/downloads/)) into more useable data format (namly json + data aggregation). 

## Use preprocessed JSON data
See `out` folder containing already transformed data from `rebrickable` csvs.
* `colors.json`
* `parts.json`
* `part-colors.json`

## Execute yourself
1. Open `Preprocess.linq` in [LinqPad](https://www.linqpad.net/)
2. Create a new data connection with `CSV Context Driver` (use [CsvLINQPadDriver](https://github.com/i2van/CsvLINQPadDriver))
    * Install driver as it's a 3rd party dependency
    * Add all csv-files from `rebrickable` folder
3. Press `F4` to opens query properties
    * Add `Newtonsoft.Json.dll` to Additional Reference
    * Add `Newtonsoft.Json` namespace to Namespace Imports
4. Select newly created connection and execute script
    * This generates all json files in `out` folder (may take a while ~45s)