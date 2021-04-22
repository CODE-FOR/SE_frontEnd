<template>
  <div class="tinymce">
    <h1>tinymce</h1>
    <editor id="tinymce" v-model="tinymceHtml" :init="init"></editor>
    <div v-html="tinymceHtml"></div>
  </div>
</template>

<script>
import tinymce from "tinymce/tinymce";
import "tinymce/themes/silver/theme";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/skins/ui/oxide/skin.css";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
import "tinymce/plugins/lists";
import "tinymce/plugins/contextmenu";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/colorpicker";
import "tinymce/plugins/textcolor";
import "tinymce/icons/default/icons.min.js";
import { teditorImg } from "../../src/api/microknowledge.js";
import "../../static/zh_CN.js";
// import placeholder from './paste-editor/plugins/placeholder.js';
export default {
  name: "tinymce",
  data() {
    return {
      // tinymceHtml: "请输入内容(内容不得超过200字)",
      init: {
        selector: "textarea", 
        language: "zh_CN",
        skin_url: "/static/skins/ui/oxide",
        height: 300,
        paste_data_images: true,
        plugins:
          "link lists image code table colorpicker textcolor wordcount contextmenu",
        toolbar:
          "bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image code | removeformat",
        branding: false,
        images_upload_handler: (blobInfo, success, failure) => {
          // this.handleImgUpload(blobInfo, success, failure);
          if (blobInfo.blob().size > self.maxSize) {
            failure("文件体积过大");
          }
          // alert(blobInfo.blob().type);
          // alert(this.accept);
          if (this.accept.indexOf(blobInfo.blob().type) >= 0) {
            uploadPic();
          } else {
            failure("图片格式错误");
          }
          // uploadPic()
          function uploadPic() {
            let formData = new FormData();
            // 服务端接收文件的参数名，文件数据，文件名
            formData.append("filename", blobInfo.filename());
            formData.append("filedata", blobInfo.blob());
            // alert(formData.get('filename'))
            alert(formData.get("filename"));
            // formData.append('upfile', blobInfo.blob(), blobInfo.filename())
            // axios({
            //   method: 'POST',
            //   // 这里是你的上传地址
            //   url: '/comment/create',
            //   data: formData
            // })
            //   .then((res) => {
            //     // 这里返回的是你图片的地址
            //     success(res.data.url)
            //   })
            //   .catch(() => {
            //     failure('上传失败')
            //   })
            teditorImg(formData).then(
              (res => {
                success(res.data.url)
              }).catch(
                failure("上传失败")
              )
            );
          }
        },
      },
    };
  },
  mounted() {
    tinymce.init({});
  },
  props: {
    accept: {
      default: "image/jpeg, image/png",
      type: String
    }
  },
  components: { Editor },
};
</script>
