<template>
  <div>
    <Row v-for='(p,index) in projects.slice(0,Math.ceil(projects.length/2))' :key='index' justify="center" align="top" type="flex" style='margin-top: 10px;'>
      <Col span='8'>
      <sponsor-project-card v-bind="projects[2*index]"></sponsor-project-card>
      </Col>
      <Col span='8' offset='2'>
      <sponsor-project-card v-if="2*index+1<projects_length" v-bind="projects[2*index+1]"></sponsor-project-card>
      </Col>
    </Row>
    <Row v-if="hasNextPage">
      <i-col style="text-align: center;font-size:20px;margin-top:20px">
        <a @click.prevent="loadData"> 加载更多 </a>
      </i-col>
    </Row>
    <Divider v-else>暂无更多</Divider>
  </div>
</template>

<script>
import SponsorProjectCard from '../components/sponsor-project-card/sponsor-project-card'
import { queryProjects } from '@/api/project'
export default {
  components: { SponsorProjectCard },
  data () {
    return {
      projects: [],
      pindex: 1,
      psize: 8,
      projects_length: 0,
      page_count: 1
    }
  },
  mounted () {
    this.loadData()
  },
  computed: {
    hasNextPage () {
      return this.pindex <= this.page_count
    }
  },
  methods: {
    loadData () {
      queryProjects({
        pindex: this.pindex,
        psize: this.psize
      }).then(res => {
        console.log(res)
        this.projects.push(...res.data.project_list.map(x => ({
          title: x.name,
          id: x.id,
          timeline: x.timeline_list,
          sponsor: x.create_user.nick_name === '' ? x.create_user.username : x.create_user.nick_name,
          overview: x.content.replace(/&nbsp;/g, '').substr(0, 200)
        })))
        this.page_count = res.data.page_count
        console.log(this.projects)
        this.projects_length = this.projects.length
      }).catch(err => {
        console.log(err)
      })
      this.pindex = this.pindex + 1
    },
    handlePageChange (i) {
      console.log(i)
      this.loadData(i)
    }
  }
}
</script>
