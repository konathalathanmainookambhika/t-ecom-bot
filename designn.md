# Design Document: Enterprise Multi-Agent Virtual Support System

## 1. System Overview

The Virtual Agent System is an enterprise-grade, multi-agent conversational AI platform designed for seamless organizational integration. Built on a distributed agent architecture, it handles 80+ concurrent live contacts per agent pool, achieving 80x efficiency and 50x faster resolution through intelligent agent collaboration, automated SOP execution, and human validation oversight.

### 1.1 Core Design Principles

1. **Multi-Agent Specialization**: Dedicated agent types for specific responsibilities
2. **Event-Driven Architecture**: Asynchronous communication via event bus
3. **Zero-Trust Security**: Authentication and authorization at every layer
4. **Seamless Integration**: Standard APIs and webhooks for organizational systems
5. **Self-Healing**: Automatic failure detection and recovery
6. **Horizontal Scalability**: Unlimited scaling through agent pool expansion
7. **Context Isolation**: Complete separation of conversation state
8. **Human-in-the-Loop**: Validation workflow with continuous learning

### 1.2 Key Performance Targets

- 80+ concurrent contacts per Conversation Agent
- <3 second response time (p95)
- 50x faster issue resolution vs human-only
- 80x efficiency multiplier
- 99.9% system uptime
- 95% issue identification accuracy
- 90% seller satisfaction
- <100ms inter-agent communication latency

## 2. Multi-Agent System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    API Gateway & Load Balancer                        │
│         (Rate Limiting, Auth, TLS Termination, DDoS Protection)      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Orchestrator   │◄──────┐
                    │     Agent       │       │
                    │   (Coordinator) │       │
                    └────────┬────────┘       │
                             │                │
              ┌──────────────┼──────────────┐ │
              │              │              │ │
         ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
         │Conversation│  │Resolution│  │Validation│
         │Agent Pool  │  │Agent Pool│  │Agent Pool│
         │(Auto-Scale)│  │(Auto-Scale)│(Auto-Scale)│
         └────┬───────┘  └────┬─────┘  └────┬─────┘
              │               │              │
              └───────────────┼──────────────┘
                              │
              ┌───────────────▼───────────────┐
              │        Event Bus (Kafka)       │
              │    (Agent Communication)       │
              └───────────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
   │   Tool    │      │  Language   │      │  Analytics  │
   │Agent Pool │      │ Agent Pool  │      │ Agent Pool  │
   └────┬──────┘      └──────┬──────┘      └──────┬──────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      Shared Services         │
              │                              │
              │  - State Store (Redis)       │
              │  - Database (PostgreSQL)     │
              │  - Cache Layer               │
              │  - SOP Repository            │
              │  - Audit Log                 │
              │  - Metrics Store             │
              └──────────────────────────────┘
```

### 2.2 Agent Types and Responsibilities

#### 2.2.1 Orchestrator Agent

**Role**: Central coordinator and traffic controller

**Responsibilities:**
- Route incoming messages to appropriate Conversation Agents
- Monitor agent pool health and trigger scaling
- Handle agent failures and contact reassignment
- Coordinate multi-agent workflows
- Load balancing across agent pools
- System-wide health monitoring

**Key Features:**
- Intelligent routing based on load, latency, and success rate
- Automatic failover and recovery
- Real-time capacity management
- Geographic routing for multi-region deployments

```typescript
class OrchestratorAgent {
  private conversationAgentPool: AgentPool<ConversationAgent>;
  private resolutionAgentPool: AgentPool<ResolutionAgent>;
  private validationAgentPool: AgentPool<ValidationAgent>;
  private eventBus: EventBus;
  private healthMonitor: HealthMonitor;
  
  async routeIncomingMessage(message: IncomingMessage): Promise<void> {
    // Check for existing conversation
    const existingAgent = await this.findConversationAgent(message.contactId);
    
    if (existingAgent && existingAgent.isHealthy()) {
      // Route to existing agent (session affinity)
      await this.sendToAgent(existingAgent, message);
    } else if (existingAgent && !existingAgent.isHealthy()) {
      // Failover to new agent
      const newAgent = await this.selectOptimalAgent();
      await this.transferContact(existingAgent, newAgent, message.contactId);
      await this.sendToAgent(newAgent, message);
    } else {
      // New conversation - select optimal agent
      const agent = await this.selectOptimalAgent();
      await this.sendToAgent(agent, message);
    }
  }
  
  private async selectOptimalAgent(): Promise<ConversationAgent> {
    const agents = this.conversationAgentPool.getHealthyAgents();
    
    // Multi-factor scoring
    const scored = agents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent)
    }));
    
    // Sort by score (higher is better)
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].agent;
  }
  
  private calculateAgentScore(agent: ConversationAgent): number {
    const metrics = agent.getMetrics();
    
    // Weighted scoring
    const loadScore = (1 - metrics.utilization) * 0.40;  // 40% weight
    const latencyScore = (1 - metrics.avgLatency / 3000) * 0.30;  // 30% weight
    const successScore = metrics.successRate * 0.20;  // 20% weight
    const proximityScore = this.calculateProximity(agent) * 0.10;  // 10% weight
    
    return loadScore + latencyScore + successScore + proximityScore;
  }
  
  async handleAgentFailure(agentId: string, agentType: AgentType): Promise<void> {
    console.log(`Agent failure detected: ${agentId} (${agentType})`);
    
    // Get failed agent
    const failedAgent = await this.getAgent(agentId, agentType);
    
    if (agentType === 'conversation') {
      // Transfer all active contacts
      const contacts = await failedAgent.getActiveContacts();
      
      for (const contactId of contacts) {
        const newAgent = await this.selectOptimalAgent();
        await this.transferContact(failedAgent, newAgent, contactId);
      }
    }
    
    // Remove from pool
    await this.removeAgent(agentId, agentType);
    
    // Spawn replacement
    await this.spawnReplacementAgent(agentType);
    
    // Alert operations
    await this.alertOps({
      severity: 'high',
      message: `Agent ${agentId} failed and was replaced`,
      agentType: agentType
    });
  }
  
  async scaleAgentPool(
    agentType: AgentType,
    targetSize: number
  ): Promise<void> {
    const pool = this.getAgentPool(agentType);
    const currentSize = pool.size();
    
    if (targetSize > currentSize) {
      // Scale up
      const toAdd = targetSize - currentSize;
      for (let i = 0; i < toAdd; i++) {
        await this.spawnAgent(agentType);
      }
    } else if (targetSize < currentSize) {
      // Scale down gracefully
      const toRemove = currentSize - targetSize;
      const agents = pool.getAgentsByLoad(); // Sorted by load
      
      for (let i = 0; i < toRemove; i++) {
        const agent = agents[i];
        await this.gracefulShutdown(agent);
      }
    }
  }
}
```

#### 2.2.2 Conversation Agent

**Role**: Handle seller interactions and maintain conversation context

**Responsibilities:**
- Manage 80+ concurrent conversations
- Authenticate sellers
- Detect intent and classify issues
- Maintain conversation history and context
- Coordinate with Language Agents for translation
- Trigger Resolution Agents when needed
- Generate responses

**Agent Pool Configuration:**
- Min instances: 5
- Max instances: 100
- Capacity per agent: 80 concurrent contacts
- Total system capacity: 8,000 concurrent contacts
- Scale-up trigger: 70% average utilization
- Scale-down trigger: 30% average utilization

```typescript
class ConversationAgent {
  private agentId: string;
  private contacts: Map<string, ContactContext>;
  private maxCapacity: number = 80;
  private eventBus: EventBus;
  private languageAgent: LanguageAgentClient;
  private intentClassifier: IntentClassifier;
  
  async handleMessage(message: Message): Promise<void> {
    // Get or create contact context
    let contact = this.contacts.get(message.contactId);
    
    if (!contact) {
      contact = await this.createContact(message);
      this.contacts.set(message.contactId, contact);
    }
    
    // Update last activity
    contact.updateActivity();
    
    // Process in isolated context
    await this.processInContext(contact, message);
  }
  
  private async processInContext(
    contact: ContactContext,
    message: Message
  ): Promise<void> {
    try {
      // 1. Authentication check
      if (!contact.isAuthenticated()) {
        await this.authenticate(contact, message);
        return;
      }
      
      // 2. Language processing
      const processed = await this.languageAgent.processMessage(
        message.text,
        contact.getLanguage()
      );
      
      // 3. Intent classification
      const intent = await this.intentClassifier.classify(
        processed.text,
        contact.getHistory()
      );
      
      // 4. Update context
      contact.addMessage({
        role: 'seller',
        text: processed.text,
        originalText: processed.originalText,
        timestamp: Date.now()
      });
      
      // 5. Determine action
      if (intent.requiresResolution) {
        // Delegate to Resolution Agent
        await this.eventBus.publish('resolution.request', {
          contactId: contact.getId(),
          sellerId: contact.getSellerId(),
          issue: intent.issue,
          context: contact.serialize()
        });
        
        // Send acknowledgment
        const response = await this.generateAcknowledgment(intent);
        await this.sendResponse(contact, response);
        
      } else if (intent.needsClarification) {
        // Ask clarifying question
        const question = await this.generateClarification(intent);
        await this.sendResponse(contact, question);
        
      } else {
        // Direct response
        const response = await this.generateResponse(intent, contact);
        await this.sendResponse(contact, response);
      }
      
    } catch (error) {
      await this.handleError(contact, error);
    }
  }
  
  private async sendResponse(
    contact: ContactContext,
    response: string
  ): Promise<void> {
    // Translate if needed
    const language = contact.getLanguage();
    const translated = language !== 'en' 
      ? await this.languageAgent.translateResponse(response, language)
      : response;
    
    // Add to history
    contact.addMessage({
      role: 'agent',
      text: response,
      translatedText: translated,
      timestamp: Date.now()
    });
    
    // Send to seller
    await this.messagingService.send({
      contactId: contact.getId(),
      text: translated
    });
  }
  
  canAcceptContact(): boolean {
    return this.contacts.size < this.maxCapacity;
  }
  
  getMetrics(): AgentMetrics {
    const activeContacts = this.contacts.size;
    const utilization = activeContacts / this.maxCapacity;
    
    return {
      agentId: this.agentId,
      activeContacts: activeContacts,
      utilization: utilization,
      avgLatency: this.calculateAvgLatency(),
      successRate: this.calculateSuccessRate(),
      messagesPerSecond: this.calculateThroughput()
    };
  }
  
  async gracefulShutdown(): Promise<void> {
    // Stop accepting new contacts
    this.accepting = false;
    
    // Wait for active contacts to complete or transfer
    while (this.contacts.size > 0) {
      await this.sleep(1000);
      
      // Transfer long-running contacts
      for (const [contactId, contact] of this.contacts) {
        if (contact.getDuration() > 300000) { // 5 minutes
          await this.requestTransfer(contactId);
        }
      }
    }
    
    // Cleanup
    await this.cleanup();
  }
}
```


#### 2.2.3 Resolution Agent

**Role**: Execute SOPs and coordinate tool operations

**Responsibilities:**
- Match issues to appropriate SOPs
- Execute SOP steps sequentially
- Coordinate with Tool Agents for operations
- Collect required information
- Request validation when needed
- Handle resolution failures

**Agent Pool Configuration:**
- Min instances: 10
- Max instances: 200
- Capacity per agent: 20 concurrent resolutions
- Specialization: By issue category (refunds, orders, account, shipping, payments)

**Specialization Benefits:**
- Cached SOPs for faster execution
- Domain expertise for better error handling
- Optimized tool agent connections
- Improved success rates

```typescript
class ResolutionAgent {
  private agentId: string;
  private specialization: ResolutionSpecialization;
  private activeResolutions: Map<string, SOPExecution>;
  private toolAgents: Map<string, ToolAgentClient>;
  private eventBus: EventBus;
  private sopRepository: SOPRepository;
  
  async handleResolutionRequest(request: ResolutionRequest): Promise<void> {
    // Check specialization match
    if (!this.canHandle(request.issue.category)) {
      // Forward to specialized agent
      await this.eventBus.publish('resolution.forward', {
        request: request,
        requiredSpecialization: request.issue.category
      });
      return;
    }
    
    // Match SOP
    const sop = await this.sopRepository.match(request.issue);
    
    if (!sop) {
      // No SOP found - escalate
      await this.escalate(request, 'no_sop_match');
      return;
    }
    
    // Create execution context
    const execution = new SOPExecution({
      sopId: sop.id,
      contactId: request.contactId,
      sellerId: request.sellerId,
      context: request.context,
      sop: sop
    });
    
    this.activeResolutions.set(request.contactId, execution);
    
    // Execute SOP
    await this.executeSOP(execution);
  }
  
  private async executeSOP(execution: SOPExecution): Promise<void> {
    try {
      while (!execution.isComplete()) {
        const step = execution.getCurrentStep();
        
        switch (step.type) {
          case 'collect_info':
            await this.collectInformation(execution, step);
            break;
            
          case 'tool_call':
            await this.executeToolStep(execution, step);
            break;
            
          case 'decision':
            await this.executeDecision(execution, step);
            break;
            
          case 'validation':
            await this.requestValidation(execution, step);
            return; // Wait for validation
            
          case 'escalate':
            await this.escalate(execution, step.reason);
            return;
        }
        
        execution.moveToNextStep();
      }
      
      // Resolution complete
      await this.completeResolution(execution);
      
    } catch (error) {
      await this.handleResolutionError(execution, error);
    }
  }
  
  private async executeToolStep(
    execution: SOPExecution,
    step: SOPStep
  ): Promise<void> {
    // Get appropriate tool agent
    const toolAgent = this.toolAgents.get(step.toolName);
    
    if (!toolAgent) {
      throw new Error(`Tool agent not found: ${step.toolName}`);
    }
    
    // Prepare parameters from collected info
    const parameters = this.prepareParameters(
      step.parameters,
      execution.getCollectedInfo()
    );
    
    // Execute tool
    const result = await toolAgent.execute({
      operation: step.action,
      parameters: parameters,
      contactId: execution.contactId,
      sellerId: execution.sellerId
    });
    
    if (!result.success) {
      // Handle tool failure
      if (step.failureHandling === 'retry') {
        await this.retryToolStep(execution, step);
      } else if (step.failureHandling === 'escalate') {
        await this.escalate(execution, `tool_failure: ${result.error}`);
      } else {
        // Skip and continue
        execution.recordStepResult(step.id, {
          success: false,
          skipped: true,
          error: result.error
        });
      }
    } else {
      execution.recordStepResult(step.id, result);
    }
  }
  
  private async requestValidation(
    execution: SOPExecution,
    step: SOPStep
  ): Promise<void> {
    // Calculate confidence
    const confidence = this.calculateConfidence(execution);
    
    // Determine if validation needed
    if (confidence >= 95 && step.impact === 'low') {
      // Auto-approve
      execution.recordStepResult(step.id, {
        success: true,
        autoApproved: true,
        confidence: confidence
      });
      execution.moveToNextStep();
      await this.executeSOP(execution); // Continue
      return;
    }
    
    // Request human validation
    await this.eventBus.publish('validation.request', {
      requestId: this.generateRequestId(),
      contactId: execution.contactId,
      sellerId: execution.sellerId,
      action: {
        type: step.action,
        description: step.description,
        parameters: execution.getCollectedInfo(),
        impact: step.impact,
        reversible: step.reversible
      },
      context: execution.getContext(),
      confidence: confidence,
      priority: this.calculatePriority(execution, step)
    });
    
    // Wait for validation response (handled via event)
  }
  
  async handleValidationResponse(response: ValidationResponse): Promise<void> {
    const execution = this.activeResolutions.get(response.contactId);
    
    if (!execution) {
      console.error(`No active resolution for contact: ${response.contactId}`);
      return;
    }
    
    if (response.approved) {
      // Apply modifications if any
      if (response.modifications) {
        execution.applyModifications(response.modifications);
      }
      
      // Continue execution
      execution.moveToNextStep();
      await this.executeSOP(execution);
      
    } else {
      // Rejected - escalate
      await this.escalate(execution, `validation_rejected: ${response.reason}`);
    }
  }
  
  private async completeResolution(execution: SOPExecution): Promise<void> {
    // Notify Conversation Agent
    await this.eventBus.publish('resolution.complete', {
      contactId: execution.contactId,
      result: execution.getResult(),
      duration: execution.getDuration(),
      stepsExecuted: execution.getStepsExecuted()
    });
    
    // Cleanup
    this.activeResolutions.delete(execution.contactId);
    
    // Record metrics
    await this.recordMetrics(execution);
  }
  
  private calculateConfidence(execution: SOPExecution): number {
    // Multi-factor confidence calculation
    const sopMatchConfidence = execution.sop.matchConfidence;
    const infoCompleteness = execution.getInfoCompleteness();
    const historicalSuccess = this.getHistoricalSuccess(execution.sop.id);
    const contextClarity = execution.getContextClarity();
    
    return (
      sopMatchConfidence * 0.30 +
      infoCompleteness * 0.25 +
      historicalSuccess * 0.25 +
      contextClarity * 0.20
    );
  }
}
```

#### 2.2.4 Validation Agent

**Role**: Manage human validation workflow

**Responsibilities:**
- Queue validation requests by priority
- Route to appropriate human agents
- Track validation SLAs
- Learn from validation decisions
- Update confidence models
- Manage validation analytics

```typescript
class ValidationAgent {
  private agentId: string;
  private validationQueue: PriorityQueue<ValidationRequest>;
  private humanAgents: Map<string, HumanAgentConnection>;
  private learningEngine: ValidationLearningEngine;
  private eventBus: EventBus;
  
  async handleValidationRequest(request: ValidationRequest): Promise<void> {
    // Calculate priority
    const priority = this.calculatePriority(request);
    request.priority = priority;
    
    // Add to queue
    this.validationQueue.enqueue(request, priority);
    
    // Select human agent
    const humanAgent = await this.selectHumanAgent(request);
    
    // Send to human agent interface
    await this.sendToHumanAgent(humanAgent, request);
    
    // Set SLA timer
    const sla = this.getSLAForPriority(priority);
    this.setSLATimer(request.requestId, sla);
    
    // Emit metrics
    await this.emitMetric('validation.queued', {
      priority: priority,
      queueDepth: this.validationQueue.size(),
      estimatedWaitTime: this.estimateWaitTime(priority)
    });
  }
  
  async handleValidationDecision(decision: ValidationDecision): Promise<void> {
    const request = await this.getRequest(decision.requestId);
    
    // Remove from queue
    this.validationQueue.remove(decision.requestId);
    
    // Cancel SLA timer
    this.cancelSLATimer(decision.requestId);
    
    // Record decision for learning
    await this.learningEngine.recordDecision(request, decision);
    
    // Publish decision
    await this.eventBus.publish('validation.response', {
      contactId: request.contactId,
      requestId: decision.requestId,
      approved: decision.approved,
      modifications: decision.modifications,
      reason: decision.reason,
      humanAgentId: decision.humanAgentId,
      decisionTime: decision.timestamp - request.createdAt
    });
    
    // Update confidence model
    await this.updateConfidenceModel(request, decision);
    
    // Emit metrics
    await this.emitMetric('validation.completed', {
      approved: decision.approved,
      decisionTime: decision.timestamp - request.createdAt,
      priority: request.priority
    });
  }
  
  private async selectHumanAgent(
    request: ValidationRequest
  ): Promise<HumanAgentConnection> {
    const availableAgents = Array.from(this.humanAgents.values())
      .filter(agent => agent.isAvailable());
    
    if (availableAgents.length === 0) {
      // No agents available - queue and alert
      await this.alertOps('no_human_agents_available');
      return null;
    }
    
    // Score agents
    const scored = availableAgents.map(agent => ({
      agent,
      score: this.scoreHumanAgent(agent, request)
    }));
    
    // Sort by score
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].agent;
  }
  
  private scoreHumanAgent(
    agent: HumanAgentConnection,
    request: ValidationRequest
  ): number {
    // Expertise match
    const expertiseScore = agent.hasExpertise(request.action.type) ? 1.0 : 0.5;
    
    // Workload (inverse)
    const workloadScore = 1 - (agent.getCurrentWorkload() / agent.getMaxWorkload());
    
    // Historical approval rate for similar requests
    const approvalScore = agent.getApprovalRate(request.action.type);
    
    // Weighted score
    return (
      expertiseScore * 0.40 +
      workloadScore * 0.30 +
      approvalScore * 0.30
    );
  }
  
  private async updateConfidenceModel(
    request: ValidationRequest,
    decision: ValidationDecision
  ): Promise<void> {
    if (decision.approved && !decision.modifications) {
      // Perfect match - increase confidence for similar cases
      await this.learningEngine.increaseConfidence({
        actionType: request.action.type,
        contextPattern: this.extractPattern(request.context),
        amount: 0.01 // Gradual increase
      });
      
    } else if (!decision.approved) {
      // Rejected - decrease confidence
      await this.learningEngine.decreaseConfidence({
        actionType: request.action.type,
        contextPattern: this.extractPattern(request.context),
        amount: 0.05, // Faster decrease for safety
        reason: decision.reason
      });
      
    } else if (decision.modifications) {
      // Modified - slight decrease
      await this.learningEngine.decreaseConfidence({
        actionType: request.action.type,
        contextPattern: this.extractPattern(request.context),
        amount: 0.02,
        modifications: decision.modifications
      });
    }
  }
  
  getQueueMetrics(): ValidationQueueMetrics {
    return {
      totalQueued: this.validationQueue.size(),
      byPriority: {
        critical: this.validationQueue.countByPriority(Priority.CRITICAL),
        high: this.validationQueue.countByPriority(Priority.HIGH),
        medium: this.validationQueue.countByPriority(Priority.MEDIUM),
        low: this.validationQueue.countByPriority(Priority.LOW)
      },
      avgWaitTime: this.calculateAvgWaitTime(),
      oldestRequest: this.validationQueue.getOldest(),
      humanAgentsAvailable: this.countAvailableHumanAgents()
    };
  }
}
```

#### 2.2.5 Tool Agent

**Role**: Execute operations on internal systems and external APIs

**Specialized Tool Agents:**
- **Payment Tool Agent**: Refunds, transactions, payment methods
- **Order Tool Agent**: Order modifications, cancellations, tracking
- **Inventory Tool Agent**: Stock checks, product updates
- **Shipping Tool Agent**: Label generation, carrier APIs
- **Account Tool Agent**: User data, permissions, settings
- **Analytics Tool Agent**: Metrics, reports, insights

```typescript
class ToolAgent {
  private agentId: string;
  private toolName: string;
  private apiClient: APIClient;
  private cache: Cache;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private eventBus: EventBus;
  
  async execute(request: ToolRequest): Promise<ToolResult> {
    // Validate parameters
    const validation = this.validateParameters(request);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid parameters: ${validation.errors.join(', ')}`
      };
    }
    
    // Check permissions
    const authorized = await this.checkPermissions(
      request.sellerId,
      request.operation
    );
    
    if (!authorized) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }
    
    // Check cache for idempotent operations
    if (this.isIdempotent(request.operation)) {
      const cached = await this.cache.get(this.getCacheKey(request));
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
    }
    
    // Rate limiting
    const allowed = await this.rateLimiter.checkLimit(request.sellerId);
    if (!allowed) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: this.rateLimiter.getRetryAfter(request.sellerId)
      };
    }
    
    // Execute with circuit breaker
    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.apiClient.call({
          endpoint: this.getEndpoint(request.operation),
          method: this.getMethod(request.operation),
          parameters: request.parameters,
          timeout: 30000
        });
      });
      
      // Cache result
      if (this.isIdempotent(request.operation)) {
        await this.cache.set(
          this.getCacheKey(request),
          result,
          this.getCacheTTL(request.operation)
        );
      }
      
      // Audit log
      await this.auditLog.record({
        toolName: this.toolName,
        operation: request.operation,
        parameters: this.sanitizeForAudit(request.parameters),
        result: this.sanitizeForAudit(result),
        contactId: request.contactId,
        sellerId: request.sellerId,
        success: true,
        timestamp: Date.now()
      });
      
      // Emit metric
      await this.emitMetric('tool.success', {
        toolName: this.toolName,
        operation: request.operation,
        duration: result.duration
      });
      
      return { success: true, data: result.data };
      
    } catch (error) {
      await this.handleToolError(request, error);
      return {
        success: false,
        error: error.message,
        retryable: this.isRetryable(error)
      };
    }
  }
  
  private async handleToolError(
    request: ToolRequest,
    error: Error
  ): Promise<void> {
    // Audit log
    await this.auditLog.record({
      toolName: this.toolName,
      operation: request.operation,
      parameters: this.sanitizeForAudit(request.parameters),
      contactId: request.contactId,
      sellerId: request.sellerId,
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
    
    // Emit metric
    await this.emitMetric('tool.failure', {
      toolName: this.toolName,
      operation: request.operation,
      error: error.name
    });
    
    // Alert if critical
    if (this.isCriticalError(error)) {
      await this.alertOps({
        severity: 'high',
        message: `Tool ${this.toolName} critical error`,
        error: error.message,
        operation: request.operation
      });
    }
  }
  
  getHealthStatus(): ToolHealthStatus {
    return {
      toolName: this.toolName,
      healthy: this.circuitBreaker.isHealthy(),
      circuitState: this.circuitBreaker.getState(),
      successRate: this.calculateSuccessRate(),
      avgLatency: this.calculateAvgLatency(),
      requestsPerSecond: this.calculateThroughput()
    };
  }
}
```


#### 2.2.6 Language Agent

**Role**: Handle translation and language processing

**Responsibilities:**
- Detect language from text
- Translate seller messages to English
- Translate agent responses to seller's language
- Maintain translation quality
- Cache common translations

```typescript
class LanguageAgent {
  private agentId: string;
  private translationAPI: TranslationAPI;
  private detectionModel: LanguageDetectionModel;
  private translationCache: Cache;
  private qualityChecker: TranslationQualityChecker;
  
  async processMessage(
    message: string,
    knownLanguage?: string
  ): Promise<ProcessedMessage> {
    // Detect language if not known
    const language = knownLanguage || await this.detectLanguage(message);
    
    // English - no translation needed
    if (language === 'en') {
      return {
        text: message,
        language: 'en',
        translated: false
      };
    }
    
    // Check cache
    const cacheKey = this.getCacheKey(message, language, 'en');
    const cached = await this.translationCache.get(cacheKey);
    
    if (cached) {
      return {
        text: cached,
        originalText: message,
        language: language,
        translated: true,
        cached: true
      };
    }
    
    // Translate
    const translated = await this.translate(message, language, 'en');
    
    // Quality check
    const quality = await this.qualityChecker.check(
      message,
      translated,
      language,
      'en'
    );
    
    if (quality.score < 0.95) {
      // Low quality - try alternative translation
      const alternative = await this.translateWithAlternative(
        message,
       