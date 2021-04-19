<template>
  <div>
    <Row type="flex" justify="center">
      <Col span='20'>
      <Form ref="form" :model="form" :rules="ruleCustom" :label-width="80">
        <FormItem label="项目名称" prop="projectName" required='required'>
          <Input type="text" v-model="form.projectName"></Input>
        </FormItem>
        <FormItem label="项目介绍" prop="html" required='required' message='请填写项目介绍'>
          <Editor ref='editor' valueType='html' v-model="form.html" @on-change='handleIntroductionChange'></Editor>
        </FormItem>
        <FormItem label="时间线">
          <Row v-for='(item,i) in form.timeline' :key="i">
            <Col span="5">
            <DatePicker type="datetime" style="width: 200px" v-model="form.timeline[i].time" placeholder="请选择日期" :editable="false"></DatePicker>
            </Col>
            <Col span='6' offset='2'>
            <Input type='text' placeholder="请输入事件" v-model="form.timeline[i].event"></Input>
            </Col>
            <Col offset='1' span='5'>
            <Button type="success" @click="form.timeline.push({time:'',event:''})">
              <Icon type="ios-add" />添加</Button>
            <Button v-if='i!==0' @click="form.timeline.splice(i,1)" type="error">
              <Icon type="ios-close" />删除</Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem>
          <Button v-if="showButton" type="primary" @click="handleSubmit('form')">提交</Button>
        </FormItem>
      </Form>
      </Col>
    </Row>
  </div>
</template>
<script>
import Editor from '@/components/editor/editor'
import { createProject, modifyProject } from '@/api/project'
import { getUserInfo } from '@/api/user'
export default {
  components: {
    Editor
  },
  props: {
    modify: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    html: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    timeline: {
      type: Array,
      default: () => ([])
    },
    id: {
      type: Number,
      default: -1
    },
    showButton: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      form: {
        projectName: this.modify ? this.title : '',
        timeline: this.modify ? (this.timeline.length > 0 ? this.timeline : [{ time: '', event: '' }]) : [{ time: '', event: '' }],
        html: this.modify ? this.html : '',
        text: this.modify ? this.content : ''
      },
      ruleCustom: {
        projectName: [
          { required: true, message: '请填写项目名称', trigger: 'blur' }
        ],
        html: [
          { required: true, message: '请填写项目介绍', trigger: 'blur' }
        ]
      }
    }
  },
  async mounted () {
    if (!this.$store.state.user.id) {
      await getUserInfo().then(res => {
        this.$store.commit('setUserProfile', res.data)
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    }
    if (!this.$store.state.user.userIsSponsor) {
      this.$router.push({
        name: 'home'
      })
      this.$Message.info({
        content: '您不是赞助商，无权访问发布项目页面',
        duration: 4
      })
    }
    if (this.html !== '') {
      this.$refs.editor.setHtml(this.html)
    }
  },
  methods: {
    handleIntroductionChange (html, text) {
      this.form.text = text
      this.form.html = html
    },
    handleSubmit (name) {
      for (let t of this.form.timeline) {
        console.log(t.time)
      }
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (!this.modify) {
            createProject({
              name: this.form.projectName,
              content: this.form.text,
              html_content: this.form.html,
              timeline_list: this.form.timeline
            }).then(res => {
              this.$Message.success('发布成功！')
            }).catch(err => {
              console.log(err)
            })
          } else {
            modifyProject({
              id: this.id,
              name: this.form.projectName,
              content: this.form.text,
              timeline_list: this.form.timeline,
              html_content: this.form.html
            }).then(res => {
              this.$Message.success('修改成功！')
            }).catch(err => {
              console.log(err)
            })
          }
        } else {
          this.$Message.error('发布失败!')
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    }
  }
}
</script>
