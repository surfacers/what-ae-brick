import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Image, ImageSourcePropType} from 'react-native';
import { fetch, decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';

let model:tf.GraphModel | undefined;

async function initModel(){
    await tf.ready();
    const modelJson = require('../assets/model/model.json');
    const modelWeights1 = require('../assets/model/group1-shard1of4.bin');
    const modelWeights2 = require('../assets/model/group1-shard2of4.bin');
    const modelWeights3 = require('../assets/model/group1-shard3of4.bin');
    const modelWeights4 = require('../assets/model/group1-shard4of4.bin');
    model = await tf.loadGraphModel(
        bundleResourceIO(modelJson, 
            [modelWeights1,modelWeights2,modelWeights3,modelWeights4]));
}
export async function predict(image:string) : Promise<PredictionResult> {
    console.log("in predict")
    if(model === undefined){
        console.log("init Model")
        await initModel();
        console.log("Model initialized")
    }
    if(model !== undefined){
        // console.log(image)
        // const image = "data:image/jpg;base64,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";
        // const image = "data:image/jpeg;base64,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"

        console.log("model is defined")
        const b = Buffer.from(image.replace("data:image/jpeg;base64,", ""), 'base64')
        console.log("buffer read")
        const imageTensor =  decodeJpeg(b).reshape([1, 224, 224, 3]).asType('float32').div(255.0);
    
        console.log("before model.predict")
        const prediction = model.predict([imageTensor]);
        const class_id = prediction.as1D().argMax().dataSync()[0]
        console.log(class_id)
        return {
            class: labels[class_id],
            class_id: class_id,
            score: 0.0
        };
    }
    throw Error("Model initialization failed");
}
type PredictionResult = {
    class:string;
    class_id:number;
    score:number;
}

export const labels = ["2445_plate-2x12", "2456_brick-2x6", "3001_brick-2x4", "3002_brick-2x3", "3003_brick-2x2", "3004_brick-1x2", "3005_brick-1x1", "3006_brick-2x10", "3007_brick-2x8", "3008_brick-1x8", "3009_brick-1x6", "3010_brick-1x4", "3020_plate-2x4", "3021_plate-2x3", "3022_plate-2x2", "3023_plate-1x2", "3024_plate-1x1", "3034_plate-2x8", "3460_plate-1x8", "3622_brick-1x3", "3623_plate-1x3", "3666_plate-1x6", "3710_plate-1x4", "3795_plate-2x6", "3832_plate-2x10", "4477_plate-1x10", "60479_plate-1x12", "6111_brick-1x10", "6112_brick-1x12"]