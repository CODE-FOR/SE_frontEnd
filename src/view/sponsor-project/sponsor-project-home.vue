<template>
  <div>
    <h1 style="text-align: center;">{{title}}</h1>
    <h2 style="text-align: right;"><span>赞助商:</span>
      <span class='sponsor'>{{sponsor}}</span></h2>
    <Row type="flex" justify="center">
      <Col span='22'>
      <Tabs :animated="false" value="overview">
        <TabPane label="项目概述" name="overview">
          <Card>
            <Row>
              <Col span='16'>
              <div>
                <p class='overview' style='display:inline-block' v-html="overview"></p>
              </div>
              </Col>
              <Col offset='2' span='6'>
              <Card>
                <p slot='title' style='font-size:20px;'>时间线</p>
                <timeline :schedule="timeline_list" style='display:inline-block'></timeline>
              </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
        <!-- <TabPane label='赞助商信息' name='sponsor'>
          <Card>
            <div>
              <p class='overview'>{{sponsor_message}}
              </p>
            </div>
          </Card>
        </TabPane> -->
        <TabPane label="讨论" name="discussion">
          <discussion>
          </discussion>
        </TabPane>
        <TabPane label="微知识" name="microKnowledge">
          <knowledge-all></knowledge-all>
        </TabPane>
        <TabPane label="添加微知识" name="addMicroKnowledge">
          <KnowledgeAdd></KnowledgeAdd>
        </TabPane>
      </Tabs>
      </Col>
    </Row>
  </div>
</template>
<script>
import Timeline from '@/view/components/timeline/timeline.vue'
import Discussion from './discussion'
import KnowledgeAll from './knowledge-all'
import KnowledgeAdd from './knowledge-add'
import { queryProject } from '@/api/project'
// import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
export default {
  components: {
    Timeline,
    Discussion,
    KnowledgeAll,
    KnowledgeAdd
  },
  data () {
    return {
      id: this.$route.params['project_id'],
      title: 'NP完全问题',
      sponsor: '剑门关桥东大学',
      overview: '',
      timeline_list: [{
        time: new Date(2020, 5, 1),
        event: '项目起始'
      },
      {
        time: new Date(2020, 7, 15),
        event: '第一次线上讨论会'
      },
      {
        time: new Date(2020, 9, 30),
        event: '第二次线上讨论会'
      },
      {
        time: new Date(2020, 11, 1),
        event: '项目结束'
      }
      ],
      discussionList: [],
      pindex: 1,
      psize: 10
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      queryProject({
        id: this.id
      }).then(res => {
        this.title = res.data.name
        this.timeline_list = res.data.timeline_list
        this.sponsor = res.data.create_user.nick_name === '' ? res.data.create_user.username : res.data.create_user.nick_name
        this.overview = res.data.html_content
      }).catch(err => {
        console.log(err)
      })
    }
  }

}

</script>
<style>
.sponsor {
  color: black;
  font-size: 20px;
}
</style>
