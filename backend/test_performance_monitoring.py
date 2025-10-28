#!/usr/bin/env python3
"""
本地性能监控测试脚本

用于在部署到 Render 前验证性能监控端点是否正常工作
"""

import requests
import time
import json
from datetime import datetime

# 配置
BASE_URL = "http://localhost:8000"  # 本地测试
# BASE_URL = "https://your-app.onrender.com"  # Render 测试时取消注释


def print_section(title):
    """打印分隔线"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def test_root_endpoint():
    """测试根路径"""
    print_section("测试 1: 根路径 /")

    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return True
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False


def test_health_endpoint():
    """测试健康检查端点"""
    print_section("测试 2: 健康检查 /health")

    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/health")
        elapsed = time.time() - start

        print(f"状态码: {response.status_code}")
        print(f"响应时间: {elapsed:.3f}秒")

        data = response.json()
        print(f"\n服务状态: {data.get('status')}")

        # 获取运行时间，优先使用可读格式
        uptime_readable = data.get("uptime_readable")
        if not uptime_readable:
            uptime_seconds = data.get("uptime_seconds", 0)
            uptime_readable = f"{uptime_seconds}秒"
        print(f"运行时间: {uptime_readable}")

        print(f"环境: {data.get('environment')}")
        print(f"版本: {data.get('version')}")

        print("\n组件状态:")
        for component, status in data.get("components", {}).items():
            status_emoji = "✅" if status else "❌"
            print(f"  {status_emoji} {component}: {status}")

        return True
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False


def test_metrics_endpoint():
    """测试性能指标端点"""
    print_section("测试 3: 性能指标 /metrics")

    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/metrics")
        elapsed = time.time() - start

        print(f"状态码: {response.status_code}")
        print(f"响应时间: {elapsed:.3f}秒")

        data = response.json()
        print(f"\n运行时间: {data.get('uptime_readable')}")
        print(f"版本: {data.get('version')}")

        print("\n组件状态:")
        for component, status in data.get("component_status", {}).items():
            status_emoji = "✅" if status == "ready" else "❌"
            print(f"  {status_emoji} {component}: {status}")

        return True
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False


def test_response_times():
    """测试响应时间一致性"""
    print_section("测试 4: 响应时间测试（5次）")

    times = []
    for i in range(5):
        try:
            start = time.time()
            response = requests.get(f"{BASE_URL}/health")
            elapsed = time.time() - start
            times.append(elapsed)
            print(f"  请求 {i + 1}: {elapsed:.3f}秒")
            time.sleep(0.5)  # 等待 0.5 秒
        except Exception as e:
            print(f"  ❌ 请求 {i + 1} 失败: {e}")

    if times:
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        print(f"\n统计:")
        print(f"  平均响应时间: {avg_time:.3f}秒")
        print(f"  最快响应: {min_time:.3f}秒")
        print(f"  最慢响应: {max_time:.3f}秒")
        print(f"  响应时间范围: {max_time - min_time:.3f}秒")
        return True

    return False


def test_recipe_generation():
    """测试菜谱生成端点"""
    print_section("测试 5: 菜谱生成 API")

    try:
        payload = {"description": "我有土豆和鸡蛋，做一道简单的菜"}

        print("发送请求...")
        start = time.time()
        response = requests.post(f"{BASE_URL}/api/v1/recipes/generate", json=payload)
        elapsed = time.time() - start

        print(f"状态码: {response.status_code}")
        print(f"响应时间: {elapsed:.3f}秒")

        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ 生成成功!")
            print(f"菜名: {data.get('dish_name', 'N/A')}")
            print(f"菜系: {data.get('cuisine_type', 'N/A')}")
            print(f"难度: {data.get('difficulty', 'N/A')}")
            print(f"烹饪时间: {data.get('cook_time_mins', 'N/A')}分钟")
        else:
            print(f"❌ 生成失败: {response.text}")

        return True
    except Exception as e:
        print(f"❌ 错误: {e}")
        print("提示: 这个测试需要配置 API keys")
        return False


def main():
    """运行所有测试"""
    print("\n" + "🔍" * 35)
    print("Recipe Agent - 性能监控测试")
    print(f"测试目标: {BASE_URL}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔍" * 35)

    # 检查服务是否运行
    print_section("前置检查: 服务是否运行")
    try:
        requests.get(f"{BASE_URL}/", timeout=2)
        print("✅ 服务正在运行")
    except Exception as e:
        print(f"❌ 无法连接到服务: {e}")
        print("\n请先启动服务:")
        print("  cd backend")
        print("  uvicorn main:app --reload")
        return

    # 运行测试
    results = []
    results.append(("根路径", test_root_endpoint()))
    results.append(("健康检查", test_health_endpoint()))
    results.append(("性能指标", test_metrics_endpoint()))
    results.append(("响应时间", test_response_times()))
    results.append(("菜谱生成", test_recipe_generation()))

    # 总结
    print_section("测试总结")
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"  {status} - {name}")

    print(f"\n总计: {passed}/{total} 测试通过")

    if passed == total:
        print("\n🎉 所有测试通过！可以部署到 Render 了。")
    else:
        print("\n⚠️  部分测试失败，请检查后再部署。")


if __name__ == "__main__":
    main()
