/**
 *    Copyright 2021-2022 Optimizely and contributors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

export async function getDatafile(sdkKey, ttl) {
  const datafileResponse = await fetch(
    `https://cdn.optimizely.com/datafiles/${sdkKey}.json`,
    { cf: { cachTtl: ttl } }
  );
  return await datafileResponse.text();
}

export function dispatchEvent({ url, params }) {
  const eventRequest = new Request(url, {
    method: "POST",
    body: JSON.stringify(params)
  });

  return fetch(eventRequest);
}

/** 
 * Generates a unique 16 digit user id for demo purpose. For production use, please use user Ids from your system
 * or autogenerate a uuid using a standard library such as https://www.npmjs.com/package/uuid.
 * 
 * Attribution:
 * This unique id generation function was taken from a Stack Overflow question and modified to fit our use case.
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 * This is the answer that was used
 * https://stackoverflow.com/a/21963136
 * Question by Jason Cohen:
 * https://stackoverflow.com/users/4926/jason-cohen
 * Answer by Jeff Ward:
 * https://stackoverflow.com/users/1026023/jeff-ward
 */
const lut = []; for (let i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
export function generateRandomUserId() {
  const d0 = Math.random()*0xffffffff|0;
  const d1 = Math.random()*0xffffffff|0;
  return lut[d0&0xff]+lut[d0>>8&0xff]+'-'+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
  lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff];
}
