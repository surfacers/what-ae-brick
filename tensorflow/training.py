# %% Imports
import os

import numpy as np

import tensorflow as tf
assert tf.__version__.startswith('2')

from tflite_model_maker import model_spec
from tflite_model_maker import image_classifier
from tflite_model_maker.config import ExportFormat
from tflite_model_maker.config import QuantizationConfig
from tflite_model_maker.image_classifier import DataLoader

import matplotlib.pyplot as plt

#%% Config
# Based on: https://codelabs.developers.google.com/tflite-computer-vision-train-model
image_path = "D:\\GIT\\machine-learning-project\\main\\_data_224\\"
EPOCHS = 1

data = DataLoader.from_folder(image_path)
train_data, test_data = data.split(0.9)

#%% Training 
model = image_classifier.create(train_data, epochs=EPOCHS)

#%% evaluation
loss, accuracy = model.evaluate(test_data)

#%% export
model.export(export_dir='.', export_format=ExportFormat.SAVED_MODEL)
model.export(export_dir='.', export_format=ExportFormat.LABEL)

# %%
