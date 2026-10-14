"""Concurrent readers must never observe a half-initialized real hand module."""
import importlib.util
import sys
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

PATH = Path(__file__).with_name('pipeline.py')
spec = importlib.util.spec_from_file_location('lazy_loading_pipeline_test',PATH)
P = importlib.util.module_from_spec(spec);spec.loader.exec_module(P)

class LazyHandLoadingTests(unittest.TestCase):
    def check_loader(self, loader_name, module_name, method):
        previous = sys.modules.pop(module_name,None)
        entered = threading.Event();release = threading.Event()
        results=[];errors=[]
        actual = P.importlib.util.spec_from_file_location
        def wrapped(name,path,*a,**kw):
            loaded = actual(name,path,*a,**kw)
            if name==module_name:
                original = loaded.loader.exec_module
                def execute(module):
                    entered.set()
                    if not release.wait(3):raise RuntimeError('test release timeout')
                    original(module)
                loaded.loader.exec_module=execute
            return loaded
        def call():
            try:results.append(callable(getattr(getattr(P,loader_name)(),method)))
            except Exception as exc:errors.append(type(exc).__name__)
        try:
            with patch.object(P.importlib.util,'spec_from_file_location',side_effect=wrapped):
                first=threading.Thread(target=call);first.start()
                self.assertTrue(entered.wait(2))
                second=threading.Thread(target=call);second.start()
                second.join(.05)
                release.set();first.join(3);second.join(3)
            self.assertEqual(errors,[])
            self.assertEqual(results,[True,True])
        finally:
            release.set()
            sys.modules.pop(module_name,None)
            if previous is not None:sys.modules[module_name]=previous
    def test_independent_pipeline_instances_share_cache_lock(self):
        second_spec=importlib.util.spec_from_file_location('second_lazy_pipeline',PATH)
        second=importlib.util.module_from_spec(second_spec);second_spec.loader.exec_module(second)
        self.assertIs(P._LAZY_HAND_LOCK,second._LAZY_HAND_LOCK)
    def test_failed_import_does_not_poison_next_attempt(self):
        name='agent_stack_code_author'
        previous=sys.modules.pop(name,None)
        actual=P.importlib.util.spec_from_file_location
        def broken(module_name,path):
            spec=actual(module_name,path)
            spec.loader.exec_module=lambda mod:(_ for _ in ()).throw(RuntimeError('fixture failure'))
            return spec
        try:
            with patch.object(P.importlib.util,'spec_from_file_location',side_effect=broken):
                with self.assertRaises(RuntimeError):P._code_author_hand()
            self.assertNotIn(name,sys.modules)
            self.assertTrue(callable(P._code_author_hand().wants_author))
        finally:
            sys.modules.pop(name,None)
            if previous is not None:sys.modules[name]=previous
    def test_code_author_routing_never_observes_partial_module(self):
        self.check_loader('_code_author_hand','agent_stack_code_author','wants_author')
    def test_pointer_routing_never_observes_partial_module(self):
        self.check_loader('_pointer_hand','agent_stack_pointer','wants_pointer')

if __name__=='__main__':unittest.main()
