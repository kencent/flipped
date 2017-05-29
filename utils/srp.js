const sjcl =  require('sjcl')
function getA(bits,salt,){
    var username = '13410794959';
    var password = '001024';
    var bits = bits+0;
    var salt = sjcl.codec.hex.toBits(salt);
    // 第二步, 生成客户端随机值，使用客户端随机值换取服务器端随机值
    // client -> server: A
    // server -> client: B
    var srp = sjcl.keyexchange.srp;
    var group = srp.knownGroup(bits);
    var a = sjcl.codec.hex.toBits("bcf1abcbf6f5cfc9d0540afea863e030c27683a8edd91c86acc159699bd65112"); //sjcl.random.randomWords(8);
    var A = srp.makeA(a, group);
    console.log("A = "  + sjcl.codec.hex.fromBits(A));
    var B = sjcl.codec.hex.toBits("4560eb8eb1eb2aad79866eac6488e56e8ec7c0c9a7ba0a1bf24c6cf7e0a0008c8ec78da4d4e060130eea8ec0772808b91e6cc71f6a39cbe45b6bcf2b3739c99167294cead175f30b200783ac51f03b640056bbb9a2a9660a7fa96b683a68afc777bae36b6d0efd676b4c5db6e18acaff78e62e3117a5c22da84a2574b11e589aafff31a9283c9e99d2a0cfc5a7af88d389ca89dd6c718e6670034752dd0abdba5d68efc3dffb123ddf1bb4f1958a7179cd3953bd5b2c703db02e18e3d34a14da616f1d334e0afbd29ba422acf860e9eb406639e97ffdde7f8628d4e5a08b845c2d404931f89bf7ea7aa418afaa8c9cd4fe2fd30a8a7b3dba4940a3cb2d492015");
    if (sjcl.bn.fromBits(B).mod(group.N).equals(0)) {
        console.log("bad server");
    }
}
module.exports = {
  getA: getA,
}