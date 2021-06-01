# How to train new model
use `training.py` to retrain a image classifier

## Convert the saved model to be useable with tensorflow.js
``` bash
tensorflowjs_converter --input_format=tf_saved_model ./saved_model/saved_model ./tfjs_model --output_format=tfjs_graph_model
```
