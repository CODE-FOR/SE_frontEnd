<template>
  <Row>
    <i-col offset="1" span="7">
      <!-- <Divider> 论文信息 </Divider> -->
      <Row v-if="loading">
        <i-col class="demo-spin-col" offset="8" span="8">
          <Spin fix>
            <Icon
              type="ios-loading"
              size="18"
              class="demo-spin-icon-load"
            ></Icon>
            <div>Loading</div>
          </Spin>
        </i-col>
      </Row>
      <Row v-else>
        <KnowledgeCard
          v-bind="paperInfo"
          style="text-align: center"
          :key="paperInfo.id"
        />
        <!--
        <KnowledgeCard
          :key="paperInfo.id"
          :content="paperInfo.content"
          :creator="paperInfo.creator"
          :createAt="paperInfo.createAt"
          :tags="paperInfo.tags"
          :source="paperInfo.source"
          :publishedYear="paperInfo.publishedYear"
          :author="paperInfo.author"
        />
        -->
      </Row>
      <!--
      <Scroll v-if="papers.length !== 0" height="450">

        <Row v-if="loading">
          <i-col class="demo-spin-col">
            <Spin fix>
              <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
              <div>Loading</div>
            </Spin>
          </i-col>
        </Row>
        <Row v-else-if="hasNext">
          <i-col style="text-align: center">
            <a @click.prevent="loadMoreData"> 加载更多 </a>
          </i-col>
        </Row>
        <Row v-else>
          <i-col style="text-align: center">
            暂无更多论文
          </i-col>
        </Row>
      </Scroll>
      <template v-else-if="loading">
        <Row v-if="loading">
          <i-col class="demo-spin-col">
            <Spin fix>
              <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
              <div>Loading</div>
            </Spin>
          </i-col>
        </Row>
      </template>
      <Row v-else>
        <i-col style="text-align: center">
          暂无论文
        </i-col>
      </Row>
      -->
    </i-col>
    <i-col offset='1' span="14">
      <Card>
        <Form ref="form" :model="form" :rules="ruleCustom" :label-width="110" style="margin-right: 50px;">
          <Form-item label="论文" prop="paperCitation">
            <Row>
              <Input :disabled="true" type="text" v-model="paperCitationTitle" />
            </Row>
          </Form-item>
          <Form-item label="论文解读标题" prop="interpretationTitle"><Input type="text" placeholder="请输入论文解读题目" v-model="form.interpretationTitle" /></Form-item>
          <!-- <Form-item label="微证据引用2" prop="citation2"><Input :disabled="true" type="text" placeholder="请在右侧引用微证据" v-model="form.citation2" /></Form-item> -->
          <!-- <Form-item label="主题" prop="topic">
            <Select v-model="form.topic" multiple style="width:200px" filterable>
              <Option v-for="item in topicList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </Form-item> -->
          <!-- <Form-item label="内容" prop="content"><Input type="textarea" placeholder="内容不超过200字" maxLength=200 :rows=12 v-model="form.content" /></Form-item> -->
          <Form-item label="论文解读内容" prop="content">
            <TEditor id="tinymce" v-model="form.content" :init="editorInit"/>
          </Form-item>
          <Form-item label="标签" prop="tags"><Input type="text" placeholder="请输入至少三个标签(以空格分隔)" v-model="form.tags" /></Form-item>
          <i-col offset="5">
            <Button type="primary" @click="handleSubmit('form')" style="text-align: center" size="large" long>发布</Button>
          </i-col>
        </Form>
      </Card>
    </i-col>
  </Row>
</template>

<script>
  import TEditor from '@/components/TEditor.vue'
  import KnowledgeCard from './knowledge-card.vue'
  import { favorKnowledgeList, createConjecture, getTags } from '@/api/microknowledge.js'
  import { getUserInfo } from '@/api/user'
  import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
  import microKnowledgeIdReq from '../../api/microknowledge.js'
  import tinymce from 'tinymce'

  export default {
    components: {
      KnowledgeCard,
      TEditor
    },
    data () {
      const validateTitle = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入论文解读题目'))
        } else {
          callback()
        }
      };
      const validateContent = (rule, value, callback) => {
        value = tinymce.activeEditor.getContent();
        if (value === '') {
          callback(new Error('请输入论文解读内容(不超过3000字)'))
        } else if (value.length > 3000) {
          callback(new Error('内容不得超过3000字'))
        } else {
          callback()
        }
      };
      // const validateTopic = (rule, value, callback) => {
      //   if (value.length === 0) {
      //     callback(new Error('请选择主题'))
      //   } else {
      //     callback()
      //   }
      // }
      const validateTags = (rule, value, callback) => {
        if (value === '' || value.split(' ').length < 3) {
          callback(new Error('请输入至少3个标签(以空格分隔)'))
        } else {
          callback()
        }
      };

      return {
        id: parseInt(this.$route.params.id),
        loading: true,
        pageIndex: 1,
        hasNext: false,
        pageSize: 5,
        topicList: [],
        paperCitationTitle: "default title",
        paperTitleView: true,
        interpretation_id: -1,
        interpretationTitle: "",
        form: {
          topic: [], // tags
          content: '',
          // tags: '',
          paperCitation: '',
          // citation2: '',
          paperId1: '',
          // citationid2: ''
          interpretationTitle: ""
        },
        paperInfo: { //TODO: confirmation with backend
          id: 20,
          title: "default title",
          content: "<b>default content</b>",
          creator: "default interpreter",
          createAt: "0000-00-00",
          publishYear: "-1",
          tags: ["default_tag_1", "default_tag_2"],
          author: ["default author"],
          source: "default source",
          items: [],
          pageComponent: {
            pageIndex: 1,
            pageSize: 1,
            items: []
          }
        },
        ruleCustom: {
          interpretationTitle: [
            {
              required: true,
              validator: validateTitle,
              trigger: 'blur'
            }
          ],
          // citation2: [
          //   {
          //     required: true,
          //     validator: validatePaper,
          //     trigger: 'blur'
          //   }
          // ],
          // topic: [
          //   {
          //     required: true,
          //     validator: validateTopic,
          //     trigger: 'blur'
          //   }
          // ],
          content: [
            {
              required: true,
              validator: validateContent,
              trigger: 'blur'
            }
          ],
          // year: [
          //   {
          //     required: true,
          //     message: '请输入参考文献年份',
          //     trigger: 'blur'
          //   }
          // ],
          tags: [
            {
              required: true,
              validator: validateTags,
              trigger: 'blur'
            }
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
      this.loadData();
      this.getTopicList();
    },

    methods: {
      loadData: function() {
        this.loading = false;
        // TODO: 粘过来的，还没改完
        // paper id: 20 -> Attention is all you need
        microKnowledgeIdReq(this.paperInfo.id, 0, "get")
          .then((res) => {
            this.paperCitationTitle = res.data.title;
            this.paperInfo.title = res.data.title;
            this.paperInfo.content = res.data.abstract;
            this.paperInfo.creator = res.data.created_by;
            this.paperInfo.createAt = getLocalTime(res.data.created_at);
            this.paperInfo.publishedYear = res.data.publishedYear;
            this.paperInfo.tags = res.data.tags;
            this.paperInfo.author = res.data.author;
            this.paperInfo.source = res.data.source;
            /*this.paperInfo.pageComponent.items = this.paperInfo.items.slice(
              (this.pageComponent.pageIndex - 1) * this.pageComponent.pageSize,
              Math.min(
                this.paperInfo.pageComponent.pageIndex * this.paperInfo.pageComponent.pageSize,
                this.items.length
              )
            );
            console.log(this.paperInfo.pageComponent.items);
            */
            this.loading = false;
          })
          .catch((error) => {
            console.log(error);
          });
        alert(this.paperInfo.title);

        /*
        favorKnowledgeList({
          pindex: this.pageIndex,
          num_per_page: this.pageSize,
          user_id: this.$store.state.user.userId,
          micro_evidence: true,
          micro_conjecture: false
        }).then(res => {
          const data = this.changeToprops(res.data.page);
          this.paperInfo.push(...data);
          this.hasNext = res.data.has_next;
          this.loading = false
        }).catch(err => {
          this.$Modal.error(getErrModalOptions(err))
        });

         */
      },

      handleSubmit (name) {
        alert();
        this.$refs[name].validate(valid => {
          if (valid) {
            const tags = this.form.topic.map(tag => { return { name: tag, type: 0 } }).concat(this.form.tags.split(' ').map(tag => { return { name: tag, type: 1 } }));
            createConjecture('post', {
              // content: this.form.content,
              content: tinymce.activeEditor.getContent(),
              tags: tags,
              paper_id: this.form.papaerId1
            }).then(res => { this.$Message.success('发布成功!请等待审核！') }).catch(err => { this.$Modal.error(getErrModalOptions(err)) })
          } else {
            this.$Message.error('发布失败!')
          }
        })
      },

      handlePaperCitation(id, title) {
        this.interpretation_id = id;
        this.paperCitationTitle = title;
        this.paperTitleView = false;
      },

      handleReset (name) {
        this.$refs[name].resetFields()
      },

      // TODO: only choose one paper, but citation can have two
      handleChosePaper (event) {
        if (event.cited) {
          if (this.form.paperCitation === '') {
            [this.form.papaerId1, this.form.paperCitation] = [event.id, event.content]
          } else if (this.form.citation2 === '') {
            [this.form.citationid2, this.form.citation2] = [event.id, event.content]
          }
        } else {
          if (this.form.papaerId1 === event.id) {
            [this.form.papaerId1, this.form.paperCitation] = [this.form.citationid2, this.form.citation2]
          }
          [this.form.citationid2, this.form.citation2] = ['', '']
        }
      },

      changeToprops (array) {
        return array.map(item => {
          return {
            id: item.id,
            creator: item.created_by,
            kind: 0,
            createAt: getLocalTime(item.created_at),
            publishedYear: item.published_year,
            content: item.content,
            tags: item.tags,
            isLike: item.is_like,
            isCollect: item.is_favor,
            likeNumber: item.like_num,
            favorNumber: item.favor_num,
            displayType: 1,
            source: item.source,
            citation: item.citation
          }
        })
      },

      loadMoreData () {
        this.pageIndex += 1;
        this.loadData()
      },
      getTopicList () {
        getTags('get', {
          pindx: 1,
          num_per_page: 99,
          presupposed: true
        }).then(res => {
          this.topicList = res.data.page.map(tag => ({ value: tag.name, label: tag.name }))
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
</script>

<style>
</style>
