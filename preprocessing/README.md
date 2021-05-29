# Rebrickable Data Preprocessing
Preprocessing rebrickable database ([available as csv files on their website](https://rebrickable.com/downloads/)) into more useable data. 

## Use 'built' data
See `out` folder containing already transformed data from `rebrickable`.
* `colors.csv`
* `parts.csv`
* `part-colors.csv`

## Execute yourself
1. Open `Preprocess.linq` in [LinqPad](https://www.linqpad.net/)
2. Create a new connection with `CSV Context Driver` (use [CsvLINQPadDriver](https://github.com/i2van/CsvLINQPadDriver))
    * Install it as it's a 3rd party dependency
    * Add all csv-files from `rebrickable` folder
3. Select newly created connection and execute script