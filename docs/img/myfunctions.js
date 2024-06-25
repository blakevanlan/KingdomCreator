function Yaml_Parsing(file_content) {

        // YAML string to Javascript object
  var obj= []
  obj = jsyaml.load( file_content );
  
  return obj;

};