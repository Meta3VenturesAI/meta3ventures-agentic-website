import { BlogPost } from '../types/blog';

// Blog posts data store
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'future-of-ai-trends-2025',
    title: "The Future of AI: Trends Shaping 2025 and Beyond",
    excerpt: "Explore the transformative AI trends that are revolutionizing industries and creating new opportunities for innovation and growth.",
    content: `# The Future of AI: Trends Shaping 2025 and Beyond

Artificial Intelligence continues to evolve at an unprecedented pace, reshaping industries and creating new possibilities for innovation. As we look ahead to 2025 and beyond, several key trends are emerging that will define the next era of AI development and implementation.

## 1. Autonomous AI Agents

The rise of autonomous AI agents represents a significant shift in how we approach artificial intelligence. These systems can:

- Operate independently
- Make complex decisions
- Learn and adapt from experience
- Collaborate with other AI agents

## 2. AI-Human Collaboration

The future of AI isn't about replacement, but enhancement. We're seeing:

- More intuitive human-AI interfaces
- Better natural language understanding
- Contextual awareness in AI systems
- Seamless integration into daily workflows

## 3. Ethical AI and Governance

As AI becomes more prevalent, ethical considerations are taking center stage:

- Transparent decision-making processes
- Built-in bias detection and mitigation
- Privacy-preserving AI techniques
- Regulatory compliance frameworks

## Looking Ahead

The next few years will be crucial in determining how AI technologies evolve and integrate into our society. Organizations that embrace these trends while maintaining a focus on ethical implementation will be best positioned for success in the AI-driven future.`,
    image: "/images/blog1-pexels-photo-8386440.webp",
    date: "April 15, 2025",
    author: {
      name: "Liron Langer",
      avatar: "/images/Liron1.jpg"
    },
    category: "ai",
    tags: ["Artificial Intelligence", "Machine Learning", "Innovation"],
    readTime: "8 min read",
    published: true
  },
  {
    id: '2',
    slug: 'building-resilient-web3-infrastructure',
    title: "Building Resilient Web3 Infrastructure",
    excerpt: "A deep dive into the essential components of robust Web3 infrastructure and best practices for scalable blockchain applications.",
    content: `# Building Resilient Web3 Infrastructure

As Web3 technologies mature, the need for robust and scalable infrastructure becomes increasingly critical. This article explores key considerations and best practices for building resilient Web3 systems.

## Foundation Components

### 1. Distributed Systems
- Node architecture
- Consensus mechanisms
- Data replication strategies

### 2. Security Measures
- Multi-signature protocols
- Zero-knowledge proofs
- Audit trails

### 3. Scalability Solutions
- Layer 2 implementations
- Sharding approaches
- State channels

## Best Practices

1. **Redundancy**
   - Multiple node deployment
   - Backup systems
   - Failover mechanisms

2. **Monitoring**
   - Real-time analytics
   - Performance metrics
   - Alert systems

3. **Updates and Maintenance**
   - Continuous integration
   - Automated testing
   - Version control

## Future Considerations

The evolution of Web3 infrastructure will continue to present new challenges and opportunities. Staying ahead requires:

- Adaptive architecture
- Flexible scaling strategies
- Continuous learning and improvement`,
    image: "/images/blog2-pexels-photo-8370752.jpeg",
    date: "April 10, 2025",
    author: {
      name: "Liron Langer",
      avatar: "/images/Liron1.jpg"
    },
    category: "blockchain",
    tags: ["Web3", "Blockchain", "Infrastructure"],
    readTime: "12 min read",
    published: true
  },
  {
    id: '3',
    slug: 'rise-of-agentic-ai-systems',
    title: "The Rise of Agentic AI Systems",
    excerpt: "Understanding how autonomous AI agents are transforming business operations and creating new possibilities for intelligent automation.",
    content: `# The Rise of Agentic AI Systems

Agentic AI represents a paradigm shift in artificial intelligence, moving beyond reactive systems to proactive, goal-oriented agents that can operate autonomously in complex environments.

## What Makes AI Agentic?

Agentic AI systems possess several key characteristics:

- **Autonomy**: Ability to operate without constant human oversight
- **Goal-oriented behavior**: Working towards specific objectives
- **Environmental awareness**: Understanding and adapting to context
- **Learning capabilities**: Improving performance over time

## Applications in Business

### 1. Customer Service
- Intelligent chatbots that understand context
- Proactive issue resolution
- Personalized customer experiences

### 2. Operations Management
- Supply chain optimization
- Predictive maintenance
- Resource allocation

### 3. Decision Support
- Data analysis and insights
- Risk assessment
- Strategic planning assistance

## Implementation Challenges

While promising, agentic AI systems face several challenges:

- **Trust and reliability**: Ensuring consistent performance
- **Ethical considerations**: Maintaining human oversight
- **Integration complexity**: Working with existing systems
- **Scalability**: Managing multiple agents effectively

## The Future of Agentic AI

As these systems mature, we can expect to see:

- More sophisticated multi-agent collaborations
- Better human-AI interaction models
- Industry-specific specialized agents
- Enhanced safety and control mechanisms

The key to successful implementation lies in thoughtful design, gradual deployment, and continuous monitoring to ensure these powerful systems serve human interests effectively.`,
    image: "/images/blog3-pexels-photo-7567443.jpeg",
    date: "April 5, 2025",
    author: {
      name: "Liron Langer",
      avatar: "/images/Liron1.jpg"
    },
    category: "ai",
    tags: ["Agentic AI", "Automation", "Business Intelligence"],
    readTime: "10 min read",
    published: true
  }
];

// Helper functions for blog management
export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getBlogPostById = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

export const getRelatedPosts = (currentPost: BlogPost, limit: number = 3): BlogPost[] => {
  return blogPosts
    .filter(post => post.id !== currentPost.id)
    .filter(post => 
      post.category === currentPost.category ||
      post.tags.some(tag => currentPost.tags.includes(tag))
    )
    .slice(0, limit);
};

export const getLatestPosts = (limit: number = 3): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const filterPosts = (query: string, category: string = 'all'): BlogPost[] => {
  return blogPosts.filter(post => {
    const matchesQuery = 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = category === 'all' || post.category === category;
    
    return matchesQuery && matchesCategory;
  });
};

export const getAllCategories = (): string[] => {
  const categories = new Set(blogPosts.map(post => post.category));
  return Array.from(categories);
};

export const getAllTags = (): string[] => {
  const tags = new Set(blogPosts.flatMap(post => post.tags));
  return Array.from(tags);
};