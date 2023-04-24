const shaderType = {   None: 1,   VERTEX_SHADER: 2,   FRAGSHADER: 3 };

let shader = {
    sourceCode: "",
    type: shaderType.None,
    include: function (s) {
        if(this.type == s.type)
            this.sourceCode += s.sourceCode;
    },
    compile: function() {
        
    } 
}