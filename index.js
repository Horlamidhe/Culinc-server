const  { GraphQLServer } = require('graphql-yoga')
// ... or using `require()`
// const { GraphQLServer } = require('graphql-yoga')
var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://daniel:danielclose@danielcluster-lmmkl.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true });

const Artist = mongoose.model('Artist',{
    name:String,
    image:String,
    description:String
})

const Subscription = mongoose.model('Subscription', {
  email:String
})

const LinkSchema = new mongoose.Schema({
  spotify:String,
  soundcloud:String
})
const songSchema = new mongoose.Schema({
  artists:String,
  art:String,
  title:String,
  links:LinkSchema
})
const Songs = mongoose.model('songs',songSchema)
const typeDefs = `
  type Query {
    artists:[Artist]
    songs:[Songs]
    subscriptions: [Subscription]
  }
  type Artist {
      _id:ID!
      name:String!
      image:String!
      description:String!
  }
  type Link {
      spotify:String!
      soundcloud:String!
  }
  input LinkInput {
      spotify:String!
      soundcloud:String!
  }
  type Songs {
    _id:ID!
    artists:String!
    art:String!
    title:String!
    links:Link
  }
  type Subscription {
    _id:ID!
    email:String!
  }
  type Mutation {
      createArtist(name:String!,image:String!,description:String!): Artist
      createSong(artists:String!, art:String!, title:String!,links:LinkInput): Songs
      createSubscription(email:String!):Subscription
  }
`

const resolvers = {
  Query: {
    artists: () => Artist.find(),
    songs: () => Songs.find(),
    subscriptions: () => Subscription.find()
  },
    Mutation: {
        createArtist: async(_,{name, image, description}) =>{
            const artist = new Artist({name,image,description});
            await artist.save();
            return artist
        },
        createSong: async(_,{artists, art, title,links:{spotify,soundcloud}}) =>{
          const song = new Songs({artists:artists, art:art, title:title,links:{spotify:spotify,soundcloud:soundcloud}});
          await song.save();
          return song
      },
      createSubscription: async(_,{email}) =>{
        const subscription = new Subscription({email});
        await subscription.save();
        return subscription
      }
    }
}

const server = new GraphQLServer({ typeDefs, resolvers })
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
