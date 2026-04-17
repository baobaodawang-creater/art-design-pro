import request from '@/utils/http'

export function fetchGetDashboardData() {
  return request.get<Api.Dashboard.DashboardData>({
    url: '/api/dashboard/data'
  })
}
