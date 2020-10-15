

class Department():
	def __init__(self, university, name):
		self.name = name;
		university.addDepartment(self)

	def Print(self):
		print("   Department: ", self.name);
