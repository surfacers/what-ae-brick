import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Image, ImageSourcePropType} from 'react-native';
import { fetch, decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { Rank, Tensor } from '@tensorflow/tfjs';

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
export async function predict(image:string) : Promise<string> {
    if(model === undefined){
        console.log("init model")
        await initModel();
        console.log("model initialized")
    }
    if(model !== undefined){
        const b = Buffer.from(image.replace("data:image/jpeg;base64,", ""), 'base64')
        const imageTensor =  decodeJpeg(b).reshape([1, 224, 224, 3]).asType('float32').div(255.0);
    
        const prediction = model.predict([imageTensor]) as Tensor<Rank>;
        const class_id = prediction.as1D().argMax().dataSync()[0]
        return labels[class_id]
    }
    throw Error("Model initialization failed");
}

export const labels = ["2445", "2456", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", "3009", "3010", "3020", "3021", "3022", "3023", "3024", "3034", "3460", "3622", "3623", "3666", "3710", "3795", "38320", "4477", "60479", "6111", "6112"]