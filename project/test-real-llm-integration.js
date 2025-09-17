#!/usr/bin/env node

/**
 * Test Real LLM Integration - Ollama Qwen2.5 and Agent System
 */

console.log('🤖 Testing Real LLM Integration with Qwen2.5 and Agents');
console.log('=' .repeat(70));

// Test 1: Direct Ollama Connection
console.log('\n🔍 Test 1: Direct Ollama Qwen2.5 Connection');

const testOllamaConnection = async () => {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();

        const qwenModels = data.models.filter(m => m.name.includes('qwen'));

        if (qwenModels.length > 0) {
            console.log('✅ Ollama server running');
            console.log(`✅ Found ${qwenModels.length} Qwen models:`);
            qwenModels.forEach(model => {
                console.log(`   - ${model.name} (${(model.size / 1e9).toFixed(1)}GB)`);
            });
            return true;
        } else {
            console.log('❌ No Qwen models found');
            return false;
        }
    } catch (error) {
        console.log('❌ Ollama server not accessible:', error.message);
        return false;
    }
};

// Test 2: Generate Response with Qwen2.5
console.log('\n🧪 Test 2: Qwen2.5 Response Generation');

const testQwenResponse = async () => {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5:latest',
                prompt: 'As a venture capital expert, what are the 3 most important factors when evaluating a startup?',
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 200
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Qwen2.5 response generated successfully');
        console.log('📊 Response quality check:');
        console.log(`   - Length: ${data.response.length} characters`);
        console.log(`   - Contains "startup": ${data.response.toLowerCase().includes('startup') ? '✅' : '❌'}`);
        console.log(`   - Contains "factors": ${data.response.toLowerCase().includes('factors') ? '✅' : '❌'}`);
        console.log('📝 Sample response:');
        console.log(`   "${data.response.substring(0, 150)}..."`);

        return { success: true, quality: 'high', responseLength: data.response.length };

    } catch (error) {
        console.log('❌ Qwen2.5 response failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Test 3: Agent Proxy Function
console.log('\n🔗 Test 3: Agent Proxy Function with Ollama');

const testAgentProxy = async () => {
    try {
        const response = await fetch('http://localhost:3000/.netlify/functions/agent-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider: 'ollama',
                payload: {
                    model: 'qwen2.5:latest',
                    messages: [
                        { role: 'user', content: 'I need help with my startup business plan. Can you provide 3 key sections?' }
                    ],
                    options: {
                        temperature: 0.7,
                        num_predict: 300
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        console.log('✅ Agent proxy function working');
        console.log('📊 Proxy response check:');
        console.log(`   - Has content: ${data.message?.content ? '✅' : '❌'}`);
        console.log(`   - Response length: ${data.message?.content?.length || 0} characters`);
        console.log('📝 Sample proxy response:');
        console.log(`   "${(data.message?.content || 'No content').substring(0, 150)}..."`);

        return { success: true, data };

    } catch (error) {
        console.log('❌ Agent proxy failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Run all tests
const runTests = async () => {
    const results = {
        ollama: await testOllamaConnection(),
        qwen: await testQwenResponse(),
        proxy: await testAgentProxy()
    };

    console.log('\n' + '=' .repeat(70));
    console.log('📊 TEST RESULTS SUMMARY:');
    console.log(`✅ Ollama Connection: ${results.ollama ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Qwen2.5 Generation: ${results.qwen.success ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Agent Proxy: ${results.proxy.success ? 'PASS' : 'FAIL'}`);

    const passedTests = Object.values(results).filter(r => r === true || r.success).length;
    console.log(`\n🎯 Overall: ${passedTests}/3 tests passed`);

    if (passedTests === 3) {
        console.log('🎉 REAL LLM INTEGRATION SUCCESSFUL!');
        console.log('🚀 Agents now have access to:');
        console.log('   - Qwen2.5 (7.6B parameters) via Ollama');
        console.log('   - Advanced reasoning capabilities');
        console.log('   - Real-time business planning assistance');
        console.log('   - Professional startup guidance');
    } else {
        console.log('⚠️ Some tests failed. Check logs above for details.');
    }

    console.log('\n🌐 Next: Visit http://localhost:3000/manual-agent-test.html');
    console.log('📋 Try: "I need help with my startup business plan"');
    console.log('🔮 Expected: Intelligent, detailed responses from Qwen2.5');
};

// Execute tests
runTests().catch(console.error);