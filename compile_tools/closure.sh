#!/bin/sh

# constants
compiler_path="/Users/kip/Dropbox/Kip Code/Compile Tools/closure-compiler/compiler.jar"

# translate arguments into readable var names
in_directory=$1
out_directory=$2
out_file_name=$3

# run the closure compiler with the specified files
java -jar "$compiler_path" --js $in_directory/**.js --js_output_file "$out_directory/$out_file_name" --language_out ECMASCRIPT5_STRICT --create_source_map 1

# combine all of the d.ts files
# TODO

# delete all of the other files
# TODO