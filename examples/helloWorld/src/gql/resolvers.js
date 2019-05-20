export default {
  Query: {
    greeting: (parent, args, { dataSources, userName }) => {
      return dataSources.messageApi.getContent(userName)
    }
  }
}
